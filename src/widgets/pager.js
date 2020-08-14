import {inject, bindable } from "aurelia-framework";
import { BindingEngine } from "aurelia-binding";

@inject(BindingEngine)
export class Pager {
  pageSizes = [20, 50, 100];

  @bindable pageNumber = 0;
  @bindable pageSize = 20;
  @bindable numResults;
  @bindable requiresUpdate = false;
  @bindable userInputPageNum = 1;

  pageNumbers = [];
  numPages = 0;
  showFirstPageLink = false;
  showLastPageLink = false;

  constructor(bindingEngine) {
    this.bindingEngine = bindingEngine;
  }
  attached() {
    this.subscription = this.bindingEngine
      .propertyObserver(this,"requiresUpdate")
      .subscribe(() => this.requiresUpdateChanged());
  }

  detached() {
      this.subscription.dispose();
  }
  requiresUpdateChanged() {
      console.log('update changed')
    if (this.requiresUpdate) {
      this.update();
      this.requiresUpdate = false;
    }
  }

  userInputPageNumChanged(newVal, oldVal) {
    if (!this.handlingUserInputPageNum && newVal !== "" && newVal !== null) {
      this.handlingUserInputPageNum = true;
      const newValInt = parseInt(newVal);
      if (!newValInt || newValInt > this.numPages) {
        this.userInputPageNum = oldVal;
      } else {
        this.userInputPageNum = newValInt;
      }
      this.handlingUserInputPageNum = false;
    }
  }

  update() {
    this.numPages = Math.ceil(this.numResults / this.pageSize);
    console.log(this.numPages);
    this.showFirstPageLink = this.pageNumber > 5;
    this.showLastPageLink = this.pageNumber < this.numPages - 6;

    const startPage = this.pageNumber - 4 < 0 ? 0 : this.pageNumber - 4;
    const endPage =
      this.pageNumber + 4 > this.numPages - 1
        ? this.numPages - 1
        : this.pageNumber + 4;

    this.pageNumbers = [];

    if (this.pageNumber === 5) {
      this.pageNumbers.push(0);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }

    if (this.pageNumber === this.numPages - 6) {
      this.pageNumbers.push(this.numPages - 1);
    }
  }
}
