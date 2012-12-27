function pd( func ) {
  return function( event ) {
    event.preventDefault()
    func && func(event)
  }
}

document.ontouchmove = pd()

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  escape:      /\{\{-(.+?)\}\}/g,
  evaluate:    /\{\{=(.+?)\}\}/g
};


var browser = {
  android: /Android/.test(navigator.userAgent)
}
browser.iphone = !browser.android


var app = {
  model: {},
  view: {}
}

var bb = {
  model: {},
  view: {}
}


bb.init = function() {

  var scrollContent = {
    scroll: function() {
      var self = this
      setTimeout( function() {
        if( self.scroller ) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll( $("div[id='content']")[0] )
        }
      },1)
    }
	
	
	
  }
  
  var scrollListContent = {
    scroll: function() {
      var self = this
      setTimeout( function() {
        if( self.scroller ) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll( $("div[id='listcontent']")[0] )
        }
      },1)
    }

  }


  bb.model.State = Backbone.Model.extend(_.extend({    
    defaults: {
      items: 'loading',
	  currentlist:"list"
    },
  }))
   
   bb.model.Preferences = Backbone.Model.extend(_.extend({    
    
   
    defaults: {
      fontsize: '12pt',
	  largefont:false,
	  mediumfont:false,
	  smallfont:true,
	  displayloc:false
	  
    },
	
	toggleDisplayLoc: function(){
		var self = this
		this.save({displayloc: !this.get("displayloc")});
	}
  }))
  
  bb.model.GPSLocation = Backbone.Model.extend(_.extend({    
    
   
    defaults: {
      longitude: 'unknown',
	  latitude: 'unknown',
	  
	  
    },
  }))
  
  
  
 
  bb.model.Item = Backbone.Model.extend(_.extend({    
    defaults: {
      itemtext: '', done:false, swipeon:false, listid:"", latitude:"calculating location", longitude: "calculating location"
    },

    initialize: function() {
      var self = this
      _.bindAll(self)
    },
	
	toggle: function(){
		var self = this
		this.save({done: !this.get("done")});
	},
	
	toggleSwipe: function(){
		var self = this
		this.save({swipeon: !this.get("swipeon")});
	},
	
	
	
	clear: function() {
      this.destroy();
    }

  }))
  
  bb.model.List = Backbone.Model.extend(_.extend({    
    defaults: {
      listtext: '', swipeon:false
    },
	

    initialize: function() {
      var self = this
      _.bindAll(self)
    },
	
	clear: function() {
      this.destroy();
	},
	
	toggleSwipe: function(){
		var self = this
		this.save({swipeon: !this.get("swipeon")});
	}
	
	
	
	

  }))
  
  bb.model.PreferenceStore = Backbone.Collection.extend(_.extend({    
    model: bb.model.Preferences,
    localStorage: new Store("preferences")
	,
	 addpreferences: function() {
      var self = this
	  
      var pref = new bb.model.Preferences({
        
      })
      self.add(pref)
      pref.save() 
    },
	
	updateFont: function(size)
	{
		var self =this
		self.size = size
		self.at(0).set({'fontsize' : self.size})
		
		
		self.at(0).save()
	},
	
	updateDisplayLoc: function()
	{
		var self =this
		
		self.at(0).toggleDisplayLoc()
		
		
		self.at(0).save()
	}
	
	
  
 }))
 
  bb.model.GPSLocationStore = Backbone.Collection.extend(_.extend({    
    model: bb.model.GPSLocation,
    localStorage: new Store("gpslocation")
	,
	initialize: function() {
      var self = this
      _.bindAll(self)
	  
	 
    
    },
	 addlocation: function() {
      var self = this
	
      var loc = new bb.model.GPSLocation({
        
      })
      self.add(loc)
      loc.save() 
    },
	
	findlocation: function(itemid)
	{
		var self =this
		self.itemid = itemid
		self.getlocation(self.itemid)
		
	},
	
	getlocation: function(itemid){
	  var self =this
	  self.itemid = itemid
	  var latitude
	  var longitude
		
	  navigator.geolocation.getCurrentPosition(
  function(position){
    latitude  = position.coords.latitude;
    longitude = position.coords.longitude;
    self.savelocation(self.itemid, latitude, longitude)
  },
  function(error){
    var txt;
    switch(error.code) {
      case error.PERMISSION_DENIED:    txt = 'Unknown position'; break;
      case error.POSITION_UNAVAILABLE: txt = 'Unknown position'; break;
      case error.TIMEOUT:              txt = 'Unknown position'; break;
      default: txt = 'Unknown position'
    }
   latitude = txt;
	longitude = txt;
	self.savelocation(self.itemid, latitude, longitude)
  }
);
	  
 },
 
 savelocation: function(itemid, latitude, longitude)
 {
	 var self =this
	 self.itemid = itemid
	 self.latitude = latitude
	 self.longitude = longitude
	 
	 locitem = app.model.items.get(itemid)
	 locitem.set({'latitude' : latitude})
	 locitem.set({'longitude' : longitude})
		
		
	 locitem.save()
 }
	
  
 }))


  bb.model.Items = Backbone.Collection.extend(_.extend({    
    model: bb.model.Item,
    localStorage: new Store("items")
	,

    initialize: function() {
      var self = this
      _.bindAll(self)
     self.count = 0

      self.on('reset',function() {
        self.count = self.length
      })
    },

    additem: function(textentered) {
      var self = this
	  
      var item = new bb.model.Item({
        itemtext: textentered, done:false, listid: app.model.state.get('currentlist')
      })
      self.add(item)
      self.count++
      item.save() 
	  app.model.gpslocation.findlocation(item.get('id'))
    }
	
	

  }))
  
 
   bb.model.Lists = Backbone.Collection.extend(_.extend({    
    model: bb.model.List,
    localStorage: new Store("lists")
	,

    initialize: function() {
      var self = this
      _.bindAll(self)
    
    },

    addlist: function(textentered) {
      var self = this
	  
      var list = new bb.model.List({
        listtext: textentered
      })
      self.add(list)
      list.save() 
    }
	
	

  }))
  
   bb.view.Head = Backbone.View.extend(_.extend({    
    events: {
      'tap #add': 'addselected' ,

	  'tap #cancelbutton': 'cancelselected' ,
	 
	  
	  'tap #list2': 'listselected' ,
	  
	  
	  'tap #save': 'saveselected' ,
	  
	 'tap #savelist': 'savelistselected' ,
	  
	 'tap #preferencesbutton': 'preferencesselected',
	 
	 'tap #newlistbutton': 'newlistselected',
	
	 'change input[id=small]': 'onRadioClickSmall',
	 
	'change input[id=medium]': 'onRadioClickMedium',
	
	'change input[id=large]': 'onRadioClickLarge',
	 
	'change input[id=yes]': 'onRadioClickYes',
	
	'change input[id=no]': 'onRadioClickNo'
	 
	 
	},
	
	addselected : function(){ 
        var self = this	
		self.elem.listcontent.hide()
		self.elem.content.show()
		self.elem.newitem.slideDown()
		self.elem.text.val("")
		self.elem.newlist.hide()
		self.elem.cancelbutton.show()
		self.elem.buttons.hide()
		$("#content").css({
        top: 190 })
		
		},
	  
	  cancelselected : function(){ 
        var self = this
		
		self.elem.content.show()
		self.elem.listcontent.hide()
		self.elem.prefs.hide()
		self.elem.newitem.hide()
		self.elem.newlist.hide()
		self.elem.cancelbutton.hide()
		self.elem.newlistbutton.hide()
		self.elem.buttons.show()
		
		$("#content").css({
      top: 70})
	  },
	  
	  preferencesselected : function(){ 
        var self = this
		
		self.elem.content.hide()
		self.elem.listcontent.hide()
		self.elem.prefs.show()
		self.elem.newitem.hide()
		self.elem.newlist.hide()
		self.elem.cancelbutton.show()
		self.elem.newlistbutton.hide()
		self.elem.buttons.hide()
		
		$("#content").css({
      top: 70})
	  }
	  
	  
	  ,
	  
	  listselected : function(){ 
        var self = this
		
		self.elem.newitem.hide()
		self.elem.content.hide()
		self.elem.listcontent.show()
		
		self.elem.cancelbutton.show()
		self.elem.buttons.hide()
		self.elem.newlistbutton.show()
		
        
      },
	  
	  newlistselected : function(){
		 var self = this
		 self.elem.newitem.hide() 
		 sself.elem.text.val("")
		 elf.elem.newlist.slideDown() 
		 $("#listcontent").css({
         top: 190 })
		  
	  },
	  
	  saveselected : function(){ 
        var self = this
		
		var textentered = self.elem.text.val()
		
		self.items.additem(textentered)
		
		self.elem.newitem.hide()
		self.elem.cancelbutton.hide()
		self.elem.buttons.show()
		
		$("#content").css({
      top: 70})
        //self.items.additem() 
      },
	  
	 savelistselected : function(){ 
        var self = this
		
		
		var textentered = self.elem.listtext2.val()
		
		self.lists.addlist(textentered)
		
		self.elem.prefs.hide()
		self.elem.newlist.hide()
		self.elem.buttons.show()
		
		$("#listcontent").css({
      top: 70})
	  },
	  
	  textsmall  : function(){ 
        var self = this
		
	  },
	  
	  onRadioClickSmall  : function(){ 
        var self = this
		app.model.preferences.updateFont('12pt')
		//self.preferences.at(0).set({'fontsize' : '12pt'})
		app.view.todolist.render()
		self.elem.prefs.hide()
		self.elem.content.show()
		self.elem.cancelbutton.hide()
		self.elem.buttons.show()
	  }
	  ,
	  
	  onRadioClickMedium  : function(){ 
        var self = this
		app.model.preferences.updateFont('14pt')
		//self.preferences.at(0).set({'fontsize' : '14pt'})
		app.view.todolist.render()
		self.elem.prefs.hide()
		self.elem.content.show()
		self.elem.cancelbutton.hide()
		self.elem.buttons.show()
	  }
	  ,
	  
	  onRadioClickLarge  : function(){ 
        var self = this
	    app.model.preferences.updateFont('16pt')
		//self.preferences.at(0).set({'fontsize' : '16pt'})
		app.view.todolist.render()
		self.elem.prefs.hide()
		self.elem.content.show()
		self.elem.cancelbutton.hide()
		self.elem.buttons.show()
	  },
	  
	  onRadioClickYes  : function(){ 
        var self = this
	    app.model.preferences.updateDisplayLoc()
		//self.preferences.at(0).set({'fontsize' : '16pt'})
		app.view.todolist.render()
		self.elem.prefs.hide()
		self.elem.content.show()
		self.elem.cancelbutton.hide()
		self.elem.buttons.show()
	  }
	  ,
	  
	  onRadioClickNo  : function(){ 
        var self = this
	    app.model.preferences.updateDisplayLoc()
		//self.preferences.at(0).set({'fontsize' : '16pt'})
		app.view.todolist.render()
		self.elem.prefs.hide()
		self.elem.content.show()
		self.elem.cancelbutton.hide()
		self.elem.buttons.show()
	  }
    ,
	
	initialize: function( items, lists, preferences ) {
      var self = this
      _.bindAll(self)
      self.items = items
	  self.lists = lists
	  self.preferences = preferences

      self.setElement("div[id='main']")

      self.elem = {
        add: self.$el.find('div #add'),
		cancelbutton: self.$el.find('div #cancelbutton'),
		prefs: self.$el.find('div #prefs'),
        title: self.$el.find('#heading'),
		newitem: self.$el.find('div #newitem'),
		newlist: self.$el.find('div #newlist'),
		content: self.$el.find('#content'),
		listcontent: self.$el.find('#listcontent'),
		text: self.$el.find('div #text1'),
		listtext2: self.$el.find('div #listtext'),
		//list2: self.$el.find('div #list2'),
		buttons: self.$el.find('div #buttons'),
		newlistbutton: self.$el.find('div #newlistbutton'),
		smalltx: self.$el.find('#small'),
		mediumtx: self.$el.find('#medium'),
		largetx: self.$el.find('#large'),
		disloc: self.$el.find('#yes'),
		dontdisloc: self.$el.find('#no')
      }
      
      self.tm = {
        title: _.template( self.elem.title.html() )
      }

	  self.elem.cancelbutton.hide()
	  self.elem.newlistbutton.hide()
	  self.elem.prefs.hide()
	  self.elem.listcontent.hide()

      app.model.state.on('change:currentlist',self.render)
	  app.model.state.on('change:items',self.render)
      self.items.on('add',self.render)
    },

    render: function() {
      var self = this
      
      var loaded = 'loaded' == app.model.state.get('items')
	  
	// var readlist = "General List"
	// var list = new bb.model.List({
     //   listtext: "General List"
     // })

     self.elem.title.html( self.tm.title({
       title: 'Loading...'
     }) )
	  
      if( loaded ) {
		  
		 var list = new bb.model.List({
       listtext: "General List"
      }) 
		  
		list = self.lists.get(app.model.state.get('currentlist'))  
        self.elem.title.html( self.tm.title({
       title:  list.get("listtext") 
     }) )
      }
    }
	
	   

  }))

  

 bb.view.List = Backbone.View.extend(_.extend({ 
  

    initialize: function( items, preferences ) {
      var self = this
      _.bindAll(self)

      self.setElement('#todolist')
    
      self.tm = {
        item: _.template( self.$el.html() )
      }


      self.items = items
	  self.preferences = preferences
      self.items.on('add',self.appenditem)
	   self.items.on('change',self.render)
	   self.items.on('destroy',self.render)
	   
	  //app.model.state.on('change:items',self.render)
    
    },


    render: function() {
      var self = this
     
      self.$el.empty()

      self.items.each(function(item){
		  
        self.appenditem(item)
      })
	if(self.preferences.length !=0)
	{
	  var prefers = self.preferences.at(0) 
	  var size = prefers.get('fontsize')
	  var disloc = prefers.get('displayloc')
	  
      $(".text").css( {'font-size': size})
	   $(".loc").css( {'font-size': size})
	   
	  if(disloc)
	  {
	     $(".loc").css( {'display': 'inline'})
	  }else
	  {
		 $(".loc").css( {'display': 'none'}) 
	  }
	}
    },


    appenditem: function(item) {
     /*
	  var self = this
      var html = self.tm.item( item.toJSON() )
      self.$el.append( html )      
      self.scroll()
	  */
	  var self = this
		if(item.get('listid') == app.model.state.get('currentlist'))
		{
      		var itemview = new bb.view.Item({
			model: item
     		 })

      		self.$el.append( itemview.$el )      
      		self.scroll()
		}

    }
	
	
  },scrollContent))



  bb.view.ListofLists = Backbone.View.extend(_.extend({ 
  

    initialize: function( lists, preferences ) {
      var self = this
      _.bindAll(self)
	  self.preferences = preferences

      self.setElement('#alllist')
    
      self.tm = {
        list: _.template( self.$el.html() )
      }
	  self.elem = {
        check: self.$el.find('span.check'),
		text: self.$el.find('text.check')
	  }

      self.lists = lists
      self.lists.on('add',self.appendlist)
	   self.lists.on('change',self.render)
	   self.lists.on('destroy',self.render)
	  
	  app.model.state.on('change:items',self.render)
     
    },


    render: function() {
      var self = this

      self.$el.empty()

      self.lists.each(function(list){
        self.appendlist(list)
      })
	  if(self.preferences.length !=0)
	{
	  var prefers = self.preferences.at(0) 
	  var size = prefers.get('fontsize')
      $(".text").css( {'font-size': size})
	}
    },


    appendlist: function(list) {
      /*
	  var self = this
      var html = self.tm.list( list.toJSON() )
      self.$el.append( html )      
      self.scroll()
	  */
	var self = this

      var listview = new bb.view.Listitem({
        model: list
      })

      self.$el.append( listview.$el )      
      self.scroll()

    }
	
	
	
  },scrollListContent))
  
  
  bb.view.Item = Backbone.View.extend(_.extend({    
  //el: $("#todolist"),
 
  events: {
     'tap': 'toggledone',
	 'tap #delete_tm' : 'deleteitem',
	 'swipe' : 'showdelete'
  },
	
	toggledone: function() {
		var self = this
		//window.confirm("sometext")
		this.model.toggle()	
	},
	
	deleteitem: function() {
		var self = this
		//window.confirm("sometext")
		this.model.clear()
	},
	
	showdelete: function() {
		var self = this
		//window.confirm("sometext")
		this.model.toggleSwipe()
	
	}
	
    ,
	
	initialize: function() {
      var self = this
      _.bindAll(self, "render", "toggledone", "deleteitem", "showdelete")
      self.render()
	  
	

    },

    render: function() {
      var self = this
      var html = self.tm.item( self.model.toJSON())
      self.$el.append( html ) 
	  
	 
    }

  },{
    tm: {
      item: _.template( $('#todolist').html() ),
	  
    }
	
	
	
  }))
  

  bb.view.Listitem = Backbone.View.extend(_.extend({    
  
  events: {
    
	 'tap #delete_tm' : 'deleteitem',
	 'swipe' : 'showdelete',
	 'tap' : 'changelist'
  },
	
	
	
	deleteitem: function() {
		var self = this
		//window.confirm("sometext")
		this.model.clear()
	},
	
	showdelete: function() {
		var self = this
		//window.confirm("sometext")
	
	},
	
	showdelete: function() {
		var self = this
		//window.confirm("sometext")
		this.model.toggleSwipe()
	
	},
	
	changelist: function() {
		var self = this
		app.model.state.set({currentlist: self.model.get('id')})
	
	  app.view.head.cancelselected()
	  app.view.todolist.render()
		
	
	}
	
    ,
	
    
	
	initialize: function() {
      var self = this
      _.bindAll(self)
      self.render()
	  
	 
	 app.model.state.on('change:item',self.render) 

    },

    render: function() {
      var self = this
      var html = self.tm.item( self.model.toJSON())
      self.$el.append( html ) 
	 
    }

  },{
    tm: {
      item: _.template( $('#alllist').html() ),
	  
    }
	
	
	
  }))
  

  
  
}







app.init_browser = function() {
  if( browser.android ) {
    $("#listarea").css({
      bottom: 0
    })
  }
}


app.init = function() {
  console.log('start init')

  bb.init()

  app.init_browser()


  app.model.state = new bb.model.State()
  app.model.preferences = new bb.model.PreferenceStore()
  app.model.gpslocation = new bb.model.GPSLocationStore(app.model.items)
 
  app.model.items = new bb.model.Items()
  app.model.lists = new bb.model.Lists()

  app.view.head = new bb.view.Head(app.model.items, app.model.lists, app.model.preferences)
  app.view.head.render()

  app.view.todolist = new bb.view.List(app.model.items, app.model.preferences)
   app.view.todolist.render()
  
  app.view.alllist = new bb.view.ListofLists(app.model.lists, app.model.preferences)
  app.view.alllist.render()
  
  
    app.model.preferences.fetch( {
    success: function(preferences) {
	self.preferences = preferences
      if(preferences.length ==0)
	  {
		  self.preferences.addpreferences()
		 
	  }
      var prefers = self.preferences.at(0) 
	  var textsize = prefers.get('fontsize')
      var displayloc = prefers.get('displayloc')
	  
	  if(displayloc)
	  {
		  $("input[id='yes']").attr("checked",true).checkboxradio("refresh")
		  $("input[id='no']").attr("checked",false).checkboxradio("refresh")
	  }
	  
	  
	  if(textsize == '14pt')
 	 {
	  	 $("input[id='medium']").attr("checked",true).checkboxradio("refresh")
	 	 $("input[id='small']").attr("checked",false).checkboxradio("refresh")
	     $("input[id='large']").attr("checked",false).checkboxradio("refresh")
  	 }else
  	if(textsize == '16pt')
  	{
	  	
	 	$("input[id='large']").attr("checked",true).checkboxradio("refresh")
	 	 $("input[id='small']").attr("checked",false).checkboxradio("refresh")
	     $("input[id='medium']").attr("checked",false).checkboxradio("refresh")
  	}
      
    }
  })
  

    app.model.gpslocation.fetch( {
    success: function(gpslocation) {
	self.gpslocation = gpslocation
      if(gpslocation.length ==0)
	  {
		  self.gpslocation.addlocation()
		 
	  }
      
	}
	})

  app.model.items.fetch( {
    success: function() {

      // simulate network delay
      
    }
  })
  
 
  
  

app.model.lists.fetch( {
    success: function(lists) {
		self.lists = lists
      if(lists.length ==0)
	  {
		  self.lists.addlist("General List")
		  
	  }
	    list = self.lists.at(0) 
        
		app.model.state.set({currentlist: list.get('id')})
		app.view.alllist.render()
		
		setTimeout( function() {
        app.model.state.set({items:'loaded'})
        app.view.todolist.render()
		
      }, 2000)
    
    }
  })

  console.log('end init')
}


$(app.init)
