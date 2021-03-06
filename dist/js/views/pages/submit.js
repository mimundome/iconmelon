(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/pages/submit', ['views/pages/PageView', 'views/EditCollectionView', 'models/SectionModel'], function(PageView, EditCollectionView, IconsCollectionModel) {
    var Edit;
    Edit = (function(_super) {
      __extends(Edit, _super);

      function Edit() {
        return Edit.__super__.constructor.apply(this, arguments);
      }

      Edit.prototype.template = '#submit-page-template';

      Edit.prototype.render = function() {
        Edit.__super__.render.apply(this, arguments);
        this.renderEditCollectionView();
        return this;
      };

      Edit.prototype.renderEditCollectionView = function() {
        return this.editCollectionView = new EditCollectionView({
          $el: this.$('#js-edit-collection-view-place'),
          isRender: true,
          model: new IconsCollectionModel
        });
      };

      return Edit;

    })(PageView);
    return Edit;
  });

}).call(this);
