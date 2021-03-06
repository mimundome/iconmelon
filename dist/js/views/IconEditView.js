(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/IconEditView', ['views/ProtoView', 'models/IconModel', 'underscore', 'jquery', 'helpers'], function(ProtoView, IconModel, _, $, helpers) {
    var IconEditView;
    IconEditView = (function(_super) {
      __extends(IconEditView, _super);

      function IconEditView() {
        return IconEditView.__super__.constructor.apply(this, arguments);
      }

      IconEditView.prototype.model = IconModel;

      IconEditView.prototype.template = '#icon-edit-view-template';

      IconEditView.prototype.events = {
        'click #js-destroy': 'destroy',
        'keyup #js-shape': 'preSetShape',
        'keyup #js-name': 'preSetName'
      };

      IconEditView.prototype.bindings = {
        '#js-name': {
          observe: 'name',
          onSet: 'setName'
        },
        '#js-shape': {
          observe: 'shape',
          onSet: 'setShape'
        }
      };

      IconEditView.prototype.preSetShape = function(e) {
        this.setShape($(e.target).val());
        return this.$('#js-shape').toggleClass('is-error', !this.model.get('isShapeValid'));
      };

      IconEditView.prototype.preSetName = function(e) {
        return this.$('#js-name').toggleClass('is-error', !this.model.get('isNameValid'));
      };

      IconEditView.prototype.setShape = function(val) {
        var $shape, $svgRef, hash;
        $shape = $('<g>').html(val);
        hash = helpers.generateHash();
        $shape.attr('id', hash);
        this.model.set('hash', hash);
        if (!this.model.collection.parentModel.get('isMulticolor')) {
          $shape.find('*').each(function(i, child) {
            var $child;
            if (!this.model.get('isMulticolor')) {
              $child = $(child);
              if (($child.attr('fill') !== 'none') && !($child.attr('fill').match(/url/gi))) {
                return $child.removeAttr('fill');
              }
            }
          });
        }
        $svgRef = this.$svg.find("#" + hash);
        if ($svgRef.length) {
          $svgRef.remove();
        }
        this.$svg.append($shape);
        helpers.refreshSvg();
        this.$svg = $('#svg-source');
        this.model.attributes.shape = $shape.html();
        this.model.set('isShapeValid', $shape.children().length ? true : false);
        return val;
      };

      IconEditView.prototype.setName = function(val) {
        this.model.set('isNameValid', $.trim(val).length > 0 ? true : false);
        return val != null ? val.toLowerCase() : void 0;
      };

      IconEditView.prototype.initialize = function(o) {
        this.o = o != null ? o : {};
        this.$svg = $('#svg-source');
        this.$svgWrap = App.$svgWrap;
        this.bindModelEvents();
        this.model.on('change:name', _.bind(this.modelChange, this));
        this.model.on('change:shape', _.bind(this.modelChange, this));
        IconEditView.__super__.initialize.apply(this, arguments);
        if (this.model.get('shape') && (this.model.collection.mode !== 'edit')) {
          this.setShape(this.model.get('shape'));
        }
        return this;
      };

      IconEditView.prototype.modelChange = function() {
        this.model.set('isValid', this.model.get('isNameValid') && this.model.get('isShapeValid'));
        return App.vent.trigger('edit-collection:change');
      };

      IconEditView.prototype.render = function() {
        var focusId;
        focusId = this.$(':focus').attr('id');
        IconEditView.__super__.render.apply(this, arguments);
        this.stickit();
        this.$("#" + focusId).focus();
        return this;
      };

      IconEditView.prototype.bindModelEvents = function() {
        this.model.on('change:shape', this.render);
        this.model.on('change:isNameValid', this.render);
        return this.model.on('change:isShapeValid', this.render);
      };

      IconEditView.prototype.destroy = function() {
        this.model.collection.length === 1 && this.model.collection.add({});
        this.model.destroy();
        return App.vent.trigger('edit-collection:change');
      };

      return IconEditView;

    })(ProtoView);
    return IconEditView;
  });

}).call(this);
