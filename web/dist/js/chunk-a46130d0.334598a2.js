(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-a46130d0","chunk-d80c89ca","chunk-2d0c51ea","chunk-2d0c51ea"],{"163b":function(t,e,i){"use strict";var n=i("2b0e");e["a"]=n["a"].extend().extend({name:"delayable",props:{openDelay:{type:[Number,String],default:0},closeDelay:{type:[Number,String],default:0}},data:function(){return{openTimeout:void 0,closeTimeout:void 0}},methods:{clearDelay:function(){clearTimeout(this.openTimeout),clearTimeout(this.closeTimeout)},runDelay:function(t,e){var i=this;this.clearDelay();var n=parseInt(this[t+"Delay"],10);this[t+"Timeout"]=setTimeout(e||function(){i.isActive={open:!0,close:!1}[t]},n)}}})},"2b5d":function(t,e,i){"use strict";i("b3df");var n=i("b974"),s=i("c6a6"),a=i("80d2");e["a"]={name:"v-combobox",extends:s["a"],props:{delimiters:{type:Array,default:function(){return[]}},returnObject:{type:Boolean,default:!0}},data:function(){return{editingIndex:-1}},computed:{counterValue:function(){return this.multiple?this.selectedItems.length:(this.internalSearch||"").toString().length},hasSlot:function(){return n["a"].options.computed.hasSlot.call(this)||this.multiple},isAnyValueAllowed:function(){return!0},menuCanShow:function(){return!!this.isFocused&&(this.hasDisplayedItems||!!this.$slots["no-data"]&&!this.hideNoData)}},methods:{onFilteredItemsChanged:function(){},onInternalSearchChanged:function(t){if(t&&this.multiple&&this.delimiters.length){var e=this.delimiters.find(function(e){return t.endsWith(e)});null!=e&&(this.internalSearch=t.slice(0,t.length-e.length),this.updateTags())}this.updateMenuDimensions()},genChipSelection:function(t,e){var i=this,s=n["a"].options.methods.genChipSelection.call(this,t,e);return this.multiple&&(s.componentOptions.listeners.dblclick=function(){i.editingIndex=e,i.internalSearch=i.getText(t),i.selectedIndex=-1}),s},onChipInput:function(t){n["a"].options.methods.onChipInput.call(this,t),this.editingIndex=-1},onEnterDown:function(t){t.preventDefault(),n["a"].options.methods.onEnterDown.call(this),this.getMenuIndex()>-1||this.updateSelf()},onKeyDown:function(t){var e=t.keyCode;n["a"].options.methods.onKeyDown.call(this,t),this.multiple&&e===a["q"].left&&0===this.$refs.input.selectionStart&&this.updateSelf(),this.changeSelectedIndex(e)},onTabDown:function(t){if(this.multiple&&this.internalSearch&&-1===this.getMenuIndex())return t.preventDefault(),t.stopPropagation(),this.updateTags();s["a"].options.methods.onTabDown.call(this,t)},selectItem:function(t){this.editingIndex>-1?this.updateEditing():n["a"].options.methods.selectItem.call(this,t)},setSelectedItems:function(){null==this.internalValue||""===this.internalValue?this.selectedItems=[]:this.selectedItems=this.multiple?this.internalValue:[this.internalValue]},setValue:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.internalSearch;n["a"].options.methods.setValue.call(this,t)},updateEditing:function(){var t=this.internalValue.slice();t[this.editingIndex]=this.internalSearch,this.setValue(t),this.editingIndex=-1},updateCombobox:function(){var t=Boolean(this.$scopedSlots.selection)||this.hasChips;t&&!this.searchIsDirty||(this.internalSearch!==this.getText(this.internalValue)&&this.setValue(),t&&(this.internalSearch=void 0))},updateSelf:function(){this.multiple?this.updateTags():this.updateCombobox()},updateTags:function(){var t=this.getMenuIndex();if(!(t<0)||this.searchIsDirty){if(this.editingIndex>-1)return this.updateEditing();var e=this.selectedItems.indexOf(this.internalSearch);if(e>-1){var i=this.internalValue.slice();i.splice(e,1),this.setValue(i)}if(t>-1)return this.internalSearch=null;this.selectItem(this.internalSearch),this.internalSearch=null}}}}},"3e79":function(t,e,i){"use strict";var n=i("2b0e");e["a"]=n["a"].extend().extend({name:"bootable",props:{lazy:Boolean},data:function(){return{isBooted:!1}},computed:{hasContent:function(){return this.isBooted||!this.lazy||this.isActive}},watch:{isActive:function(){this.isBooted=!0}},methods:{showLazyContent:function(t){return this.hasContent?t:void 0}}})},"4fa4":function(t,e,i){},8212:function(t,e,i){"use strict";i("4fa4");var n=i("b64a"),s=i("80d2"),a=i("58df"),o=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=i[n])}return t};e["a"]=Object(a["a"])(n["a"]).extend({name:"v-avatar",functional:!0,props:{color:String,size:{type:[Number,String],default:48},tile:Boolean},render:function(t,e){var i=e.data,a=e.props,l=e.children;i.staticClass=("v-avatar "+(i.staticClass||"")).trim(),a.tile&&(i.staticClass+=" v-avatar--tile");var r=Object(s["d"])(a.size);return i.style=o({height:r,width:r},i.style),t("div",n["a"].options.methods.setBackgroundColor(a.color,i),l)}})},bf5a:function(t,e,i){},c7ae:function(t,e,i){"use strict";i.r(e);var n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("v-combobox",{attrs:{readonly:!t.isEditable,items:t.items,"search-input":t.search,"hide-selected":"",hint:"最多可輸入五款遊戲",label:"新增遊戲",multiple:"","persistent-hint":"","small-chips":"",color:"primary"},on:{"update:searchInput":function(e){t.search=e},"update:search-input":function(e){t.search=e}},scopedSlots:t._u([{key:"no-data",fn:function(){return[i("v-list-tile",[i("v-list-tile-content",[i("v-list-tile-title",[t._v("輸入新的遊戲標籤")])],1)],1)]},proxy:!0}]),model:{value:t.editGame,callback:function(e){t.editGame=e},expression:"editGame"}})},s=[],a={props:{myGame:Array,isEditable:{type:Boolean,default:!0}},created:function(){},data:function(){return{items:["狼人殺","阿瓦隆","矮人礦坑"],model:[],search:null}},computed:{editGame:{get:function(){return this.model=this.myGame,this.myGame},set:function(t){this.model=t}}},watch:{model:function(t){var e=this;t.length>5&&this.$nextTick(function(){return e.model.pop()}),this.$emit("updateGame",this.model)}}},o=a,l=i("2877"),r=i("6544"),c=i.n(r),h=i("2b5d"),u=i("ba95"),d=i("5d23"),p=Object(l["a"])(o,n,s,!1,null,null,null);e["default"]=p.exports;c()(p,{VCombobox:h["a"],VListTile:u["a"],VListTileContent:d["a"],VListTileTitle:d["c"]})},cc20:function(t,e,i){"use strict";i("bf5a");var n=i("58df"),s=i("9d26"),a=i("b64a"),o=i("6a18"),l=i("98a1"),r=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=i[n])}return t};e["a"]=Object(n["a"])(a["a"],o["a"],l["a"]).extend({name:"v-chip",props:{close:Boolean,disabled:Boolean,label:Boolean,outline:Boolean,selected:Boolean,small:Boolean,textColor:String,value:{type:Boolean,default:!0}},computed:{classes:function(){return r({"v-chip--disabled":this.disabled,"v-chip--selected":this.selected&&!this.disabled,"v-chip--label":this.label,"v-chip--outline":this.outline,"v-chip--small":this.small,"v-chip--removable":this.close},this.themeClasses)}},methods:{genClose:function(t){var e=this,i={staticClass:"v-chip__close",on:{click:function(t){t.stopPropagation(),e.$emit("input",!1)}}};return t("div",i,[t(s["a"],"$vuetify.icons.delete")])},genContent:function(t){return t("span",{staticClass:"v-chip__content"},[this.$slots.default,this.close&&this.genClose(t)])}},render:function(t){var e=this.setBackgroundColor(this.color,{staticClass:"v-chip",class:this.classes,attrs:{tabindex:this.disabled?-1:0},directives:[{name:"show",value:this.isActive}],on:this.$listeners}),i=this.textColor||this.outline&&this.color;return t("span",this.setTextColor(i,e),[this.genContent(t)])}})}}]);
//# sourceMappingURL=chunk-a46130d0.334598a2.js.map