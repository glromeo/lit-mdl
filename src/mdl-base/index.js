import {LitElement} from 'lit-element';

import materialStyle from "material-design-lite/src/material-design-lite.scss";
import style from "./index.scss";

export class MdlComponent extends LitElement {

    static get styles() {
        return [
            materialStyle,
            style
        ]
    }

    constructor() {
        super();
        this.classList.add("mdl-component");
    }
}