import {css, customElement, html, property, query} from 'lit-element';
import {classMap} from "lit-html/directives/class-map.js";
import {ifDefined} from "lit-html/directives/if-defined.js";
import {MdlComponent} from "../mdl-base";
import {KEY_DOWN, KEY_ESCAPE, KEY_UP} from "../keycode.js";
// const highlightSearch = directive((search) => (part) => { part.setValue('Hello')});
import rippleStyle from "../ripple.scss";

@customElement("mdl-spinner")
export class MdlSpinner extends MdlComponent {

    static get styles() {
        return [
            super.styles,
            rippleStyle,
            css`
                input::placeholder {  
                    color: lightgray; 
                } 
                
                .material-icons {
                    user-select: none; 
                }
                
                .material-icons.disabled {
                    opacity: 0.33; 
                }
            `
        ]
    }

    @property({type: String})
    label = "Label";

    @property({type: Number, attribute: "value", reflect: true})
    value;

    @property({type: Number, attribute: "min-value"})
    minValue = Number.MIN_VALUE;

    @property({type: Number, attribute: "max-value"})
    maxValue = Number.MAX_VALUE;

    @property({type: Number, attribute: "increment"})
    increment;

    @property({attribute: "active", type: Boolean})
    isActive = false;

    constructor() {
        super();
    }

    focus(event) {
        this.isActive = true;
    }

    blur(event) {
        this.isActive = false;
    }

    @query(".mdl-textfield__input")
    textfield;

    change() {
        console.log("change", this.value);
    }

    input() {
        this.value = Number(this.textfield.value);
    }

    clearTextfield() {
        this.textfield.value = "";
    }

    keyUp({keyCode}) {
        switch (keyCode) {
            case KEY_ESCAPE:
                this.clearTextfield();
                return;
            case KEY_DOWN:
                this.decrementValue();
                return;
            case KEY_UP:
                this.incrementValue();
                return;
        }
    }

    incrementValue(event) {
        this.value = isNaN(this.value) ? this.value : Math.min(this.value + 1, this.maxValue);
    }

    decrementValue(event) {
        this.value = isNaN(this.value) ? this.value : Math.min(this.value - 1, this.minValue);
    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            this.textfield.value = this.value;
        }
        if (changedProperties.has("min-value")) {
            if (isNaN(this.minValue)) this.minValue = Number.MIN_VALUE;
        }
        if (changedProperties.has("max-value")) {
            if (isNaN(this.maxValue)) this.maxValue = Number.MAX_VALUE;
        }
        if (changedProperties.has("isActive")) {
            console.log("isActive", this.isActive);
            if (this.isActive) this.textfield.focus();
        }
    }

    preventDefault(event) {
        event.preventDefault();
    }

    render() {
        const textFieldClass = classMap({
            "is-focused": this.isActive,
            "is-dirty": !isNaN(this.value)
        });
        const placeholder = this.isActive && !this.value ? "placeholder" : undefined;
        return html`
            <div style="display: flex; align-items: stretch">
                <i class="material-icons md-18 ${isNaN(this.value) || this.value <= this.minValue ? "disabled" : "enabled"}" 
                   @click=${this.decrementValue} @mousedown=${this.preventDefault}
                   style="padding: 20px 4px 0 0">
                    remove_circle_outline
                </i>
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label ${textFieldClass}" @keyup=${this.keyUp}>
                    <input type="text" class="mdl-textfield__input" placeholder="${ifDefined(placeholder)}" 
                           @focus=${this.focus} @blur=${this.blur} @input=${this.input} @change=${this.change}>
                    <label class="mdl-textfield__label">${this.label}</label>
                </div>
                <i class="material-icons md-18 ${isNaN(this.value) || this.value >= this.maxValue ? "disabled" : "enabled"}"
                   @click=${this.incrementValue} @mousedown=${this.preventDefault}
                   style="padding: 20px 0 0 4px">
                    add_circle_outline
                </i>
            </div>
        `;
    }
}