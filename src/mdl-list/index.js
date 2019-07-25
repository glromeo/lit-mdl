import {css, customElement, html, property, query, queryAll} from 'lit-element';
import {classMap} from "lit-html/directives/class-map.js";
import {ifDefined} from "lit-html/directives/if-defined.js";
import {MdlComponent} from "../mdl-base";
import {KEY_DOWN, KEY_ESCAPE, KEY_UP} from "../keycode.js";
import {escapeRegExp} from "../util.js";
import {MaterialRipple} from "../ripple.js";

// const highlightSearch = directive((search) => (part) => { part.setValue('Hello')});
import rippleStyle from "../ripple.scss";

@customElement("mdl-item")
export class MdlItem extends MdlComponent {

    constructor() {
        super();
    }

    connectedCallback() {
        console.log("connectedCallback", this);
    }

    disconnectedCallback() {
        console.log("disconnectedCallback", this);
    }
}

@customElement("mdl-list")
export class MdlList extends MdlComponent {

    static get styles() {
        return [
            super.styles,
            rippleStyle,
            css`
                :host {
                    display: flex;
                    flex-direction: column;
                }

                .highlight {
                    background-color: yellow;
                    font-weight: bold;
                }
                
                mdl-item {
                    display: block;
                    background-color: white;
                }
                
                mdl-item.active {
                    background-color: #e8e8e8;
                }
                
                .material-icons {
                    user-select: none; 
                }
            `
        ]
    }

    @property({type: Array})
    selectedItems;

    constructor() {
        super();
    }

    @property({type: Object})
    search;

    @property()
    activeIndex = -1;

    keyUp({keyCode}) {
        switch (keyCode) {
            case KEY_ESCAPE:
                this.clearTextfield();
                return;
            case KEY_DOWN:
                do {
                    this.activeIndex = Math.min(this.activeIndex + 1, this.suggestions.length - 1);
                } while (this.suggestions[this.activeIndex].disabled);
                return;
            case KEY_UP:
                do {
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                } while (this.suggestions[this.activeIndex].disabled);
                return;
        }
    }

    updated(changedProperties) {

        for (const changedProperty of changedProperties.keys()) {
            console.log(changedProperty, "has changed");
        }
    }

    clickItem({target}) {
        this.selectedItems.indexOf(target.index);
        // TODO: implement binary search
    }

    highlightSearch(text) {
        if (this.search) {
            const parts = [];
            let lastIndex = this.search.lastIndex = 0;
            let found = 0, result = this.search.exec(text);
            while (result) {
                ++found;
                parts.push({
                    text: text.substring(lastIndex, result.index),
                    highlight: false
                });
                parts.push({
                    text: result[0],
                    highlight: true
                });
                lastIndex = this.search.lastIndex;
                result = this.search.exec(text);
            }
            parts.push({
                text: text.substring(lastIndex, text.length),
                highlight: false
            });
            return found > 0 ? parts.filter(part => part.text).map(part => {
                if (part.highlight) {
                    return html`<span class="highlight">${part.text}</span>`;
                } else {
                    return html`${part.text}`;
                }
            }) : null;
        } else {
            return text ? html`${text}` : null;
        }
    }

    render() {
        return html`
            <slot></slot>
        `;
    }
}