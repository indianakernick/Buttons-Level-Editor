"use strict";

class PropertyList {
  constructor(element) {
    this.element = element;
    this.list = [];
  }

  setList(entities) {
    this.list = entities;
    this.update();
  }

  update() {
    this.element.empty();
    for (const entity of this.list) {
      let div = $(String.raw`<div class="entity">
        <div class="entity_name">
          <span>${entity.name}</span>
        </div>
      </div>`);
      this.element.append(div);

      for (const key in entity.props) {
        div.append(this.createProperty(entity.props, key, entity.getPropType(key)));
      }

      div.append(this.createInsertButton(entity));
    }
  }

  createInsertButton(entity) {
    let row = $(String.raw`<div class="insert_prop">
      <div class="button">
        <span>Insert Property</span>
      </div>
      <select></select>
    </div>`);

    if (Object.keys(entity.props).length === entity.defs.size) {
      row.css("display", "none");
    }

    let children = row.children();
    let button = $(children[0]);
    let select = $(children[1]);

    for (let [propName] of entity.defs) {
      if (!entity.props.hasOwnProperty(propName)) {
        select.append(this.createSimpleOption(propName));
      }
    }
    select.children(":first-child").attr("selected", "");

    let that = this;
    button.click(function() {
      const propName = select.val();
      select.children(`option[value="${propName}"]`).remove();
      entity.createProp(propName);
      row.before(that.createProperty(entity.props, propName, entity.getPropType(propName)));

      if (select.children().length === 0) {
        row.css("display", "none");
      }
    });

    return row;
  }

  createSimpleOption(value) {
    let e = $(document.createElement("option"));
    e.val(value);
    e.html(value);
    return e;
  }

  createProperty(props, key, type) {
    let property = $(String.raw`<div class="property">
      <div class="key_cell"></div>
      <div class="val_cell"></div>
      <div class="rem_cell"></div>
    </div>`);
    let children = property.children();
    $(children[0]).append(this.createKey(key));
    $(children[1]).append(this.createValue(props, key, type));
    $(children[2]).append(this.createRemButton(property, props, key));
    return property;
  }

  createRemButton(property, props, key) {
    let e = $(String.raw`<div class="rem_button button">
      <span>X</span>
    </div>`);
    e.click(function() {
      property.remove();
      //JavaScript is so weird
      delete props[key];
      console.log(property);
      console.log(property.parent());
      console.log(property.parent().children(".insert_prop"));
      // parent of div.property is div.entity
      property.parent().children(".insert_prop").css("display", "initial");
    });
    return e;
  }

  createKey(key) {
    return $(`<span>${key}</span>`);
  }

  createValue(props, key, type) {
    switch (type) {
      case PropType.FLOAT:
        return this.createFloat(props, key);
      case PropType.UINT:
        return this.createUint(props, key);
      case PropType.VEC:
        return this.createVec(props, key);
      case PropType.ORIENT:
        return this.createOrient(props, key);
      case PropType.STRING:
        return this.createString(props, key);
      case PropType.ARRAY:
        return this.createArray(props, key);
      case PropType.BOOLEAN:
        return this.createBoolean(props, key);
      default:
        console.error("Invalid property type passes to PropertyList::createValueInput", type);
        return null;
    }
  }

  createFloat(props, key) {
    let e = $(String.raw`<input class="val_float" type="number" value="${props[key]}"/>`);
    e.change(function() {
      props[key] = e.val() * 1.0;
    });
    return e;
  }
  createUint(props, key) {
    let e = $(String.raw`<input class="val_uint" type="number" min="0" step="1" value="${props[key]}" />`);
    e.change(function() {
      props[key] = e.val() | 0;
    });
    return e;
  }
  createVec(props, key) {
    let e = $(String.raw`<div class="val_vec"></div>`);
    e.append(this.createUint(props[key], "x"));
    e.append(this.createUint(props[key], "y"));
    return e;
  }
  createOrient(props, key) {
    let e = this.createEnum(Orient, props, key);
    e.addClass("val_orient");
    return e;
  }
  createString(props, key) {
    let e = $(String.raw`<input class="val_string" type="text" value="${props[key]}" />`);
    e.change(function() {
      props[key] = e.val();
    });
    return e;
  }
  createArray(props, key) {
    let e = $(String.raw`<div class="val_array"></div>`);
    for (let i in props[key]) {
      e.append(this.createUint(props[key], i));
    }
    let button = $(String.raw`<button class="array_insert_button">Insert</button>`);
    e.append(button);
    let that = this;
    button.click(function() {
      props[key].push(0);
      button.before(that.createUint(props[key], props[key].length - 1));
    });
    return e;
  }
  createBoolean(props, key) {
    let e = this.createEnum(Boolean, props, key);
    e.addClass("val_boolean");
    return e;
  }

  createEnum(enumObject, props, key) {
    let e = $(document.createElement("select"));
    const value = props[key];
    if (enumObject.name === "Boolean") {
      e.append(this.createOption("FALSE", !value));
      e.append(this.createOption("TRUE", value));
    } else {
      for (let enumName in enumObject) {
        e.append(this.createOption(enumName, value === enumObject[enumName]));
      }
    }
    e.change(function() {
      if (enumObject.name === "Boolean") {
        props[key] = (e.val() === "TRUE");
      } else {
        props[key] = enumObject[e.val()];
      }
    });
    return e;
  }

  createOption(enumValue, selected) {
    let e = $(document.createElement("option"));
    if (selected) {
      e.attr("selected", "");
    }
    e.attr("value", enumValue);
    enumValue = enumValue.toLowerCase();
    enumValue = enumValue[0].toUpperCase() + enumValue.substr(1);
    e.html(enumValue);
    return e;
  }
};