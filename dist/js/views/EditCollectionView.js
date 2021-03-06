(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/EditCollectionView', ['views/ProtoView', 'views/IconEditView', 'collections/IconsCollection', 'collectionViews/IconsCollectionView', 'views/ThanxModalView', 'fileupload', 'jquery', 'helpers'], function(ProtoView, IconEditView, IconsCollection, IconsCollectionView, ThanxModalView, fileupload, $, helpers) {
    var EditCollectionView;
    EditCollectionView = (function(_super) {
      __extends(EditCollectionView, _super);

      function EditCollectionView() {
        return EditCollectionView.__super__.constructor.apply(this, arguments);
      }

      EditCollectionView.prototype.template = '#edit-collection-view-template';

      EditCollectionView.prototype.events = {
        'click #js-add-icon': 'addIcon',
        'click .js-submit-btn:not(.is-inactive)': 'submit',
        'click .js-submit-btn.is-inactive': 'suggestOnSubmition',
        'click .js-delete': 'delete',
        'click .js-save': 'save'
      };

      EditCollectionView.prototype.bindings = {
        '#js-collection-name': {
          observe: 'name',
          onSet: 'nameSet'
        },
        '#js-author': {
          observe: 'author',
          onSet: 'authorSet'
        },
        '#js-license': {
          observe: 'license',
          onSet: 'licenseSet'
        },
        '#js-email': {
          observe: 'email',
          onSet: 'emailSet'
        },
        '#js-website': 'website',
        '#js-moderated input': 'moderated',
        '#js-multicolor  input': {
          observe: 'isMulticolor',
          onSet: 'multicolorChange'
        }
      };

      EditCollectionView.prototype.ui = {
        submitBtn: '.js-submit-btn'
      };

      EditCollectionView.prototype.initialize = function(o) {
        this.o = o != null ? o : {};
        EditCollectionView.__super__.initialize.apply(this, arguments);
        this.iconsLoaded = [];
        this.o.mode === 'edit' && this.makeSvgData();
        this.initFileUpload();
        return this;
      };

      EditCollectionView.prototype.render = function() {
        EditCollectionView.__super__.render.apply(this, arguments);
        this.$submitButton = this.$(this.ui.submitBtn);
        this.o.mode === 'edit' && this.$('.collection-credits-b').addClass('is-edit');
        this.renderIconsCollection();
        this.stickit();
        return this;
      };

      EditCollectionView.prototype.multicolorChange = function(val) {
        _.defer((function(_this) {
          return function() {
            _this.makeSvgData(false, true);
            return _.defer(function() {
              return _this.renderIcons();
            });
          };
        })(this));
        return val;
      };

      EditCollectionView.prototype.renderIcons = function() {
        var i, view, _i, _len, _ref, _results;
        _ref = this.iconsCollection.children.toArray();
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          view = _ref[i];
          _results.push(view.render());
        }
        return _results;
      };

      EditCollectionView.prototype.suggestOnSubmition = function(e) {
        return App.notifier.show({
          type: 'error',
          text: 'You have to fill credentials and have at least one valid icon to make this button active'
        });
      };

      EditCollectionView.prototype.makeSvgData = function(isCheck, isReset) {
        if (isCheck == null) {
          isCheck = true;
        }
        if (isReset == null) {
          isReset = false;
        }
        console.time('svg load');
        this.$shapes = $('<div>');
        this.iconsCollection.collection.each((function(_this) {
          return function(model) {
            return helpers.upsetSvgShape({
              hash: model.get('hash'),
              $shapes: _this.$shapes,
              shape: model.get('shape'),
              isCheck: isCheck,
              isMulticolor: _this.model.get('isMulticolor'),
              isReset: isReset
            });
          };
        })(this));
        helpers.addToSvg(this.$shapes);
        return console.timeEnd('svg load');
      };

      EditCollectionView.prototype.renderIconsCollection = function() {
        this.iconsCollection = new IconsCollectionView({
          itemView: IconEditView,
          collection: new IconsCollection(this.model.get('icons').length ? this.model.get('icons') : [{}]),
          isRender: true,
          $el: this.$('#js-icons-place'),
          mode: this.o.mode
        });
        this.iconsCollection.collection.parentModel = this.model;
        return App.vent.on('edit-collection:change', _.bind(this.checkIfValidCollection, this));
      };

      EditCollectionView.prototype.addIcon = function() {
        return this.iconsCollection.collection.add({});
      };

      EditCollectionView.prototype.nameSet = function(val) {
        this.nameValid = !($.trim(val.length) < 1 ? true : false);
        this.$('#js-collection-name').toggleClass('is-error', !this.nameValid);
        this.checkIfValidCollection();
        return val;
      };

      EditCollectionView.prototype.authorSet = function(val) {
        this.authorValid = !($.trim(val.length) < 3 ? true : false);
        this.$('#js-author').toggleClass('is-error', !this.authorValid);
        this.checkIfValidCollection();
        return val;
      };

      EditCollectionView.prototype.emailSet = function(val) {
        var re;
        re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        this.emailValid = re.test(val);
        this.$('#js-email').toggleClass('is-error', !this.emailValid);
        this.checkIfValidCollection();
        return val;
      };

      EditCollectionView.prototype.licenseSet = function(val) {
        this.licenseValid = $.trim(val).length >= 3;
        this.$('#js-license').toggleClass('is-error', !this.licenseValid);
        this.checkIfValidCollection();
        return val;
      };

      EditCollectionView.prototype.checkIfValidCollection = function() {
        return this.enableSubmitButton(this.nameValid && this.authorValid && this.emailValid && this.licenseValid && this.isValidCollection());
      };

      EditCollectionView.prototype.isValidCollection = function() {
        var i, valid;
        i = 0;
        valid = false;
        while (i < this.iconsCollection.collection.models.length) {
          if (this.iconsCollection.collection.at(i).get('isValid')) {
            i = this.iconsCollection.collection.models.length;
            valid = true;
          }
          i++;
        }
        return valid;
      };

      EditCollectionView.prototype.enableSubmitButton = function(state) {
        return this.$submitButton.toggleClass('is-inactive', !state);
      };

      EditCollectionView.prototype.submit = function() {
        this.$submitButton.addClass('loading-eff is-inactive');
        return _.defer((function(_this) {
          return function() {
            _this.model.set('icons', _this.iconsCollection.collection.toJSON());
            return _this.model.save().then(function() {
              _this.$submitButton.removeClass('loading-eff');
              return (new ThanxModalView).onClose = function() {};
            }).fail(function(err) {
              return _this.$submitButton.removeClass('loading-eff is-inactive');
            });
          };
        })(this));
      };

      EditCollectionView.prototype["delete"] = function() {
        if (confirm('Are you sure?')) {
          return this.model.destroy();
        }
      };

      EditCollectionView.prototype.save = function() {
        return _.defer((function(_this) {
          return function() {
            _this.model.set('icons', _this.iconsCollection.collection.toJSON());
            return _this.model.save().done(function() {
              return App.notifier.show({
                type: 'ok',
                text: 'saved happily',
                delay: 4000
              });
            }).fail(function() {
              return App.notifier.show({
                type: 'error',
                text: 'saving sadness',
                delay: 4000
              });
            });
          };
        })(this));
      };

      EditCollectionView.prototype.initFileUpload = function() {
        return this.$('#fileupload').fileupload({
          url: '/file-upload',
          acceptFileTypes: /(\.|\/)(svg)$/i,
          dataType: 'text',
          limitMultiFileUploads: 999,
          add: (function(_this) {
            return function(e, data) {
              _this.filesDropped = data.originalFiles.length;
              _this.filesLoaded = 0;
              return data.submit();
            };
          })(this),
          done: (function(_this) {
            return function(e, data) {
              var name;
              _this.filesLoaded++;
              name = data.files[0].name.split('.svg')[0];
              data = {
                shape: data.result,
                name: name != null ? name.toLowerCase() : void 0,
                hash: helpers.generateHash(),
                isValid: true
              };
              _this.iconsLoaded.push(data);
              return _this.filesLoaded === _this.filesDropped && _this.finishFilesLoading();
            };
          })(this),
          error: function(e, data) {
            return App.notifier.show({
              text: 'loading error',
              type: 'error'
            });
          },
          progressall: (function(_this) {
            return function(e, data) {
              var progress;
              progress = parseInt(data.loaded / data.total * 100, 10);
              return App.$loadingLine.css({
                'width': "" + progress + "%"
              });
            };
          })(this)
        });
      };

      EditCollectionView.prototype.finishFilesLoading = function() {
        var _ref;
        this.modelToRemove = this.iconsCollection.collection.length === 1 && !this.isValidCollection() ? this.iconsCollection.collection.at(0) : null;
        this.iconsCollection.collection.mode = 'edit';
        this.iconsCollection.collection.add(this.iconsLoaded);
        if ((_ref = this.modelToRemove) != null) {
          _ref.destroy();
        }
        this.iconsLoaded = [];
        this.makeSvgData(false);
        this.checkIfValidCollection();
        return _.defer((function(_this) {
          return function() {
            return App.$loadingLine.fadeOut(100, function() {
              App.$loadingLine.width("0%");
              return App.$loadingLine.show();
            });
          };
        })(this));
      };

      return EditCollectionView;

    })(ProtoView);
    return EditCollectionView;
  });

}).call(this);
