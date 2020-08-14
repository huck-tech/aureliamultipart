import {bindable, inject} from 'aurelia-framework';

export class Autocomplete {
    @bindable additionalClass;
    @bindable placeholder;
    @bindable suggestionTemplate;
    @bindable value;
    @bindable displayProperty;
    @bindable loader;

    @bindable noSuggestionsMessage;
    @bindable noSuggestionsTemplate;
    @bindable selectedSuggestion;

    suggestions = null;
    selectedIndex = -1;
    highlightedIndex = -1;

    isSelecting = false;

    bind() {
        if (this.selectedSuggestion) {
            this.isSelecting = true;
            this.updateDisplay();
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.highlightedIndex = -1;
        this.suggestions = null;
    }

    getSuggestions(val) {
        if (val) {
            this.loader(val).then(result => {
                this.selectedIndex = -1;
                this.highlightedIndex = -1;
                this.suggestions = result;
            });
        } else {
            this.selectedIndex = -1;
            this.highlightedIndex = -1;
            this.suggestions = [];
        }
    }

    valueChanged(val) {
        if (!this.isSelecting) {
            if (val) {
                this.getSuggestions(val);
            } else {
                this.hideSuggestions();
                this.selectedSuggestion = null;
            }
        } else {
            this.isSelecting = false;
        }
    }

    selectedSuggestionChanged(newVal, oldVal) {
        if (!newVal && oldVal) {
            this.value = null;
        }
    }

    keyPressed(evt) {
        switch (evt.which) {
            case 13:
                if (this.highlightedIndex >= 0) {
                    this.select(this.highlightedIndex);
                }
                break;
            case 38:
                if (this.highlightedIndex > 0) {
                    this.highlightedIndex--;
                }
                break;
            case 40:
                if (this.highlightedIndex < this.suggestions.length - 1) {
                    this.highlightedIndex++;
                }
                break;
            default:
                return true;
        }
    }

    select(index) {
        this.selectedIndex = index;
        this.selectedSuggestion = this.suggestions[index];

        this.isSelecting = true;

        this.updateDisplay();

        this.hideSuggestions();
    }

    updateDisplay() {
        if (this.displayProperty) {
            if (typeof this.displayProperty === 'string') {
                this.value = this.selectedSuggestion[this.displayProperty];
            } else if (typeof this.displayProperty === 'function') {
                this.value = this.displayProperty(this.selectedSuggestion);
            }
        } else {
            this.value = this.selectedSuggestion;
        }
    }
}