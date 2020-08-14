import { bindable, inject, computedFrom } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { ShotSuggestionManager } from "common/shot-suggestion-manager";
import { BindingEngine } from "aurelia-binding";
import { Home } from "modules/home";
//import 'jscrollpane';

@inject(HttpClient, ShotSuggestionManager, BindingEngine, Home)
export class VarietyMatrix {
  @bindable summaryData;
  @bindable categories;
  @bindable selectedCategory = null;
  @bindable showCount = false;
  @bindable loadingSuggestions = false;
  @bindable sortBy = "aToZ";
  @bindable filters;

  constructor(httpClient, shotSuggestionManager, bindingEngine, home) {
    this.httpClient = httpClient;
    this.home = home;
    this.shotSuggestionManager = shotSuggestionManager;
    this.shotSuggestionManager.addShotsChangedHandler(c =>
      this.handleShotsChanged(c)
    );

    this.filters = {
      commercial: true,
      editorial: true,
      lessThanHd: true,
      hd: true,
      fourK: true
    };
    bindingEngine
      .propertyObserver(this, "summaryData")
      .subscribe(() => this.updateCategories());
    bindingEngine.propertyObserver(this, "sortBy").subscribe(() => this.sort());
  }

  attached() {
    //$('category-shot-list').jScrollPane();
  }

  @computedFrom("filters")
  get showCommercial() {
    return this.filters.commercial;
  }
  set showCommercial(value) {
    this.filters.commercial = value;
    this.calculateHeatIndexes();
  }

  @computedFrom("filters")
  get showEditorial() {
    return this.filters.editorial;
  }
  set showEditorial(value) {
    this.filters.editorial = value;
    this.calculateHeatIndexes();
  }

  @computedFrom("filters")
  get showLessThanHd() {
    return this.filters.lessThanHd;
  }
  set showLessThanHd(value) {
    this.filters.lessThanHd = value;
    this.calculateHeatIndexes();
  }

  @computedFrom("filters")
  get showHd() {
    return this.filters.hd;
  }
  set showHd(value) {
    this.filters.hd = value;
    this.calculateHeatIndexes();
  }

  @computedFrom("filters")
  get show4K() {
    return this.filters.fourK;
  }
  set show4K(value) {
    this.filters.fourK = value;
    this.calculateHeatIndexes();
  }

  updateCategories() {
    this.categories = [];
    // get categories from summary data, or fallback to default list
    const data =
      this.summaryData &&
      this.summaryData.categoryClipsSummaries &&
      this.summaryData.categoryClipsSummaries.length > 0
        ? this.summaryData.categoryClipsSummaries
        : this.getFallbackData();

    data
      .filter(
        c =>
          c.categoryName !== "Business & Finance" &&
          c.categoryName !== "Celebrations & Holidays"
      )
      .forEach(c => this.categories.push(this.enhanceCategory(c)));
    this.countCategories();
    this.calculateHeatIndexes();
    this.sort();
  }

  enhanceCategory(category) {
    // normalize the name
    const normalizedName = category.categoryName
      .replace(" & ", "-")
      .replace(" ", "-")
      .replace("-and-", "-")
      .toLowerCase();

    // handle special cases where name does not match
    // default is category name without spaces, ampersands, dashes, etc
    switch (normalizedName) {
      case "citiscapes":
        category.normalizedName = "cities";
        break;
      case "celebrities-entertainment":
        category.normalizedName = "entertainment";
        break;
      case "green-screen":
        category.normalizedName = "greenscreen";
        break;
      case "holidays-celebrations":
        category.normalizedName = "holidays";
        break;
      default:
        category.normalizedName = normalizedName;
        break;
    }

    // create empty collection of suggestions
    category.suggestions = [];

    return category;
  }

  setSelectedCategory(category) {
    // set selected category
    this.selectedCategory = category;

    // load suggestions for category
    this.loadSuggestions(category);
  }

  clearSelectedCategory() {
    this.selectedCategory = null;
  }

  loadSuggestions(category) {
    // indicate loading
    this.loadingSuggestions = true;

    this.shotSuggestionManager
      .loadCategoryShots(category.categoryName)
      .then(() => {
        // clear loading indicator
        this.loadingSuggestions = false;

        // clear old collection
        if (!category.suggestions) {
          category.suggestions = [];
        } else {
          category.suggestions.splice(0, category.suggestions.length);
        }

        // get unsuggested shots for category
        this.shotSuggestionManager
          .getCategoryUnsuggestedShots(category.categoryName)
          .forEach(s => {
            // add loaded categories to collection
            category.suggestions.push(s);
          });

        this.shuffle(category.suggestions);
      });
  }

  shuffle(suggestions) {
    for (let i = suggestions.length; i; i--) {
      const j = Math.floor(Math.random() * i);
      [suggestions[i - 1], suggestions[j]] = [
        suggestions[j],
        suggestions[i - 1]
      ];
    }
  }

  handleShotsChanged(changes) {
    // if a shot was added to the list, check if it's in the currently selected category, and, if it is, remove it
    if (changes.added) {
      // find all categories the added shot is in
      // changes.added.categories.forEach(c => {
      //     const filtered = this.categories.filter(c1 => c1.categoryName === c.categoryName);
      //     if (filtered.length === 0) return;

      //     // remove the shot
      //     const addedItemIndex = filtered[0].suggestions.indexOf(changes.added);
      //     if (addedItemIndex >= 0)
      //         filtered[0].suggestions.splice(addedItemIndex, 1);
      // });

      this.categories.forEach(c => {
        const filtered = c.suggestions.filter(
          s => s.description === changes.added.description
        );
        if (filtered.length === 0) return;

        const addedItemIndex = c.suggestions.indexOf(changes.added);
        if (addedItemIndex >= 0) c.suggestions.splice(addedItemIndex, 1);
      });
    }

    // if a shot was removed from the list, check if it's in the currently selected category, and, if it's not, add it
    if (changes.removed) {
      // find all the categories the removed shot is in
      // console.log(changes.removed.categories);
      changes.removed.categories.forEach(c => {
        const filtered = this.categories.filter(c1 => c1.categoryName === c);
        if (filtered.length === 0) return;

        // add the shot back
        const removedItemIndex = filtered[0].suggestions.indexOf(
          changes.removed
        );
        if (removedItemIndex < 0) filtered[0].suggestions.push(changes.removed);
      });

      // this.categories.forEach(c => {
      //         const filtered = c.suggestions.filter(s=> s.description === changes.removed.description);
      //         if (filtered.length === 0) return;

      //         const addedItemIndex = c.suggestions.indexOf(changes.removed);
      //         if(addedItemIndex >= 0)
      //             c.suggestions.push(changes.removed);
      //     }
      // );
    }
  }
  countCategories() {
    if (this.home.clipsData) {
      this.home.clipsData.forEach(clip => {
        if (!clip.userFields["user.22"]) {
          clip.userFields["user.22"] = [];
        }
        for (var i = 0; i < clip.userFields["user.22"].length; i++) {
          this.categories.forEach(category => {
            if (category.categoryName === clip.userFields["user.22"][i]) {
              if (clip.userFields["user.24"] === "Editorial") {
                category.editorialClipCount += 1;
                if (clip.userFields["user.27"] === "1280x720") {
                  category.lessThanHdClipCount += 1;
                  category.lessThanHdEditorialClipCount += 1;
                } else if (clip.userFields["user.27"] === "1920x1080") {
                  category.hdClipCount += 1;
                  category.hdEditorialClipCount += 1;
                } else if (clip.userFields["user.27"] === "3840x2160") {
                  category.fourKClipCount += 1;
                  category.fourKEditorialClipCount += 1;
                } else if (clip.userFields["user.27"] === "4096x2160") {
                  category.fourKClipCount += 1;
                  category.fourKEditorialClipCount += 1;
                }
              } else if (clip.userFields["user.24"] === "Commercial") {
                category.commercialClipCount += 1;
                if (clip.userFields["user.27"] === "1280x720") {
                  category.lessThanHdClipCount += 1;
                  category.lessThanHdCommercialClipCount += 1;
                } else if (clip.userFields["user.27"] === "1920x1080") {
                  category.hdClipCount += 1;
                  category.hdCommercialClipCount += 1;
                } else if (cli.userFields["user.27"] === "3840x2160") {
                  category.fourKClipCount += 1;
                  category.fourKCommercialClipCount += 1;
                } else if (clip.userFields["user.27"] === "4096x2160") {
                  category.fourKClipCount += 1;
                  category.fourKCommercialClipCount += 1;
                }
              }
            }
          });
        }
      });
    } else {
      this.home.clipsData = [];
    }
  }
  sort() {
    switch (this.sortBy) {
      case "aToZ":
        this.categories = this.categories.sort((c1, c2) =>
          c1.categoryName.localeCompare(c2.categoryName)
        );
        break;
      case "mostToFewest":
        this.categories = this.categories.sort(
          (c1, c2) =>
            c2.clipCount > c1.clipCount
              ? 1
              : c2.clipCount < c1.clipCount ? -1 : 0
        );
        break;
      case "fewestToMost":
        this.categories = this.categories.sort(
          (c1, c2) =>
            c1.clipCount > c2.clipCount
              ? 1
              : c1.clipCount < c2.clipCount ? -1 : 0
        );
        break;
    }
  }

  calculateHeatIndexes() {
    let minCount = null;
    let maxCount = 0;
    // calculate counts for each category
    this.categories.forEach(category => {
      let categoryTotal = 0;

      // add counts for the clips that are <HD
      if (this.filters.lessThanHd) {
        if (this.filters.commercial) {
          categoryTotal += category.lessThanHdCommercialClipCount;
        }
        if (this.filters.editorial) {
          categoryTotal += category.lessThanHdEditorialClipCount;
        }
      }

      // add counts for the clips that are HD
      if (this.filters.hd) {
        if (this.filters.commercial) {
          categoryTotal += category.hdCommercialClipCount;
        }
        if (this.filters.editorial) {
          categoryTotal += category.hdEditorialClipCount;
        }
      }

      // add counts for the clips that are 4K
      if (this.filters.fourK) {
        if (this.filters.commercial) {
          categoryTotal += category.fourKCommercialClipCount;
        }
        if (this.filters.editorial) {
          categoryTotal += category.fourKEditorialClipCount;
        }
      }

      category.lessThanHdClipCount =
        category.lessThanHdCommercialClipCount +
        category.lessThanHdEditorialClipCount;
      category.hdClipCount =
        category.hdCommercialClipCount + category.hdEditorialClipCount;
      category.fourKClipCount =
        category.fourKCommercialClipCount + category.fourKEditorialClipCount;

      category.commercialClipCount =
        category.lessThanHdCommercialClipCount +
        category.hdCommercialClipCount +
        category.fourKCommercialClipCount;
      category.editorialClipCount =
        category.lessThanHdEditorialClipCount +
        category.hdEditorialClipCount +
        category.fourKEditorialClipCount;

      category.clipCount = categoryTotal;

      // check if this is the new max or min
      if (category.clipCount > maxCount) maxCount = category.clipCount;
      if (minCount === null || category.clipCount < minCount)
        minCount = category.clipCount;
    });

    const maxDiff = maxCount - minCount;

    this.categories.forEach(category => {
      if (category.clipCount === 0) {
        category.heatIndex = 1;
      } else {
        const val = maxCount - category.clipCount;
        category.heatIndex = Math.floor((maxDiff - val) / maxDiff * 8) + 2;
      }
      if (category.heatIndex < 1) category.heatIndex = 1;
    });
  }

  getFallbackData() {
    return this.fallbackCategoryList.map(c => {
      return {
        categoryName: c,
        clipCount: 0,
        heatIndex: 1,
        fourKCommercialClipCount: 0,
        fourKEditorialClipCount: 0,
        hdCommercialClipCount: 0,
        hdEditorialClipCount: 0,
        lessThanHdCommercialClipCount: 0,
        lessThanHdEditorialClipCount: 0
      };
    });
  }

  fallbackCategoryList = [
    "Abstract",
    "Aerials",
    "Agriculture",
    "Animals & Wildlife",
    "Animations & Backgrounds",
    "Business",
    "Celebrities & Entertainment",
    "Citiscapes",
    "Education",
    "Food & Beverage",
    "Green Screen",
    "Healthcare",
    "Holidays & Celebrations",
    "Industrial",
    "Landscapes",
    "Lifestyle",
    "Manufacturing",
    "Military",
    "Nature",
    "People",
    "Politics",
    "Real Estate",
    "Slow Motion",
    "Sports",
    "Technology",
    "Timelapse",
    "Transportation",
    "Vintage",
    "Weather",
    "Websites"
  ];
}
