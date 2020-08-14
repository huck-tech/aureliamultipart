import {inject, bindable, computedFrom} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import { subdomainIsCorporate } from "main";
import {User} from 'user';
import config from 'app-config';

@inject(HttpClient, EventAggregator, User)
export class Home {

    @bindable rawClipsData;
    @bindable clipsData;
    @bindable shotSuggestionsData;
    @bindable salesData;
    @bindable subdomainIsCorporate = subdomainIsCorporate();
    @bindable totalClips;
    @bindable totalClipsComma;
    @bindable initialized = false;
    @bindable showMobileShotList = false;

    constructor(httpClient, eventAggregator, user) {
        this.httpClient = httpClient;
        this.eventAggregator = eventAggregator;
        this.user = user;

        this.eventAggregator.subscribe('selectedUserChanged', () => this.refreshAll());
        this.eventAggregator.subscribe('screenResized', dims => this.showMobileShotList = dims.width <= 1024);
    }

    get contentTypeChartConfig() {
        return {
            chartTagName: 'contentTypeChart',
            chartTagClassName: 'summary-chart',
            theme: 'clippn2',
            disabledTheme: 'clippn2Disabled',
            valueProperties: [
                {
                    propertyName: 'commercialClipCount',
                    className: 'commercial',
                    displayName: 'Commercial'
                },
                {
                    propertyName: 'editorialClipCount',
                    className: 'editorial',
                    displayName: 'Editorial'
                }
            ]
        };
    }

    get videoQualityChartConfig() {
        return {
            chartTagName: 'videoQualityChart',
            chartTagClassName: 'summary-chart',
            theme: 'clippn',
            disabledTheme: 'clippnDisabled',
            valueProperties: [
                {
                    propertyName: 'fourKClipCount',
                    className: '4K',
                    displayName: '4K'
                },
                {
                    propertyName: 'hdClipCount',
                    className: 'HD',
                    displayName: 'HD'
                },
                {
                    propertyName: 'lessThanHdClipCount',
                    className: 'less-than-HD',
                    displayName: '< HD'
                }
            ]
        };
    }

    // @computedFrom('clipsData')
    // get totalClips() {
    //     // return this.totalClipsSummary ? this.totalClipsSummary.clipCount : 0;
    //     if (this.clipsData) {
    //         return this.clipsData.length            
    //     }
    // }

    @computedFrom('clipsData')
    get averageRating() {

        if (!this.totalClipsSummary) return 0;
        return Math.round(this.totalClipsSummary.rating);    
        // return Math.round((
        //     this.totalClipsSummary.oneStarClipCount +
        //     (this.totalClipsSummary.twoStarClipCount * 2) +
        //     (this.totalClipsSummary.threeStarClipCount * 3) +
        //     (this.totalClipsSummary.fourStarClipCount * 4) +
        //     (this.totalClipsSummary.fiveStarClipCount * 5)
        // ) / this.totalClipsSummary.clipCount);
    }

    @computedFrom('salesData')
    get totalClipsSold() {
        return this.totalSalesSummary ? this.totalSalesSummary.clipsSold : 0;
    }

    @computedFrom('salesData')
    get totalSales() {
        return this.totalSalesSummary ? this.totalSalesSummary.totalSalesAmount : 0;
    }

    // @computedFrom('rawClipsData','clipsData')
    // get yieldPercentage() {
    //     return this.totalClipsSummary && this.totalRawClipsSummary && this.totalRawClipsSummary.totalDuration > 0
    //                ? Math.round(this.totalClipsSummary.totalDuration / 
    //                 (this.totalClipsSummary.totalDuration + this.totalRawClipsSummary.totalDuration) * 100)
    //                : 0;
    // }

    activate() {
        if (!this.initialized) {
            this.initialized = true;
            this.refreshAll();
        }
    }
    numberWithCommas = (number) => {
        this.totalClipsComma = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    getTotalSummary(data) {
        if (!data) return {};

        let totalSummary = data.filter(c => c.periodType === 'Total')[0];
        if (!totalSummary) return {};

        return totalSummary;
    }

    refreshAll() {
        this.isLoading = false;

        // return Promise.all([
        //     // this.refreshRawClipsData(),
        //     this.refreshClipsData(),
        //     // this.refreshSalesData(),
        //     // this.refreshShotSuggestionsData()
        // ]).then(() => {
        //     this.isLoading = false;
        // }).catch(err => {
        //     this.isLoading = false;
        // });
    }

    refreshRawClipsData() {
        console.log("In raw");
        const userId = this.user && this.user.selectedUser ? this.user.selectedUser.id : null;
        return this.httpClient
            // .fetch('/uploads/summaries/current' + (userId ? `?userId=${userId}` : ''), {
            .fetch(config.summaryUrls.rawClipSummaryUrl + (userId ? `?userId=${userId}` : ''), {
                method: 'get',
                mode: 'cors'
            }).then(resp => {
                if (resp.ok) {
                    resp.json().then(o => {
                        this.rawClipsData = o.items;
                        // this.totalRawClipsSummary = this.getTotalSummary(this.rawClipsData);
                        this.totalRawClipsSummary = o.totalItems;
                    });
                }
            });
    }

    refreshClipsData() {

        const userId = this.user && this.user.selectedUser ? this.user.selectedUser.id : null;
        return this.httpClient
            // .fetch('/clips/summaries/current' + (userId ? `?userId=${userId}` : ''), {
            .fetch(config.summaryUrls.clipSummaryUrl + (userId ? `?userId=${userId}` : ''), {
                method: 'get',
                mode: 'cors'
            }).then(resp => {
                if (resp.ok) {
                    resp.json().then(o => {
                        let items = o.items;
                        // let itemsArray = [];
                        // for (let i=0; i<o.length; i++) {
                        //     itemsArray.push(o[i].items)
                        // }
                        // let items = itemsArray.reduce(function(a,b){ return a.concat(b); }, []);
                        this.totalClips = items.length;  
                        this.numberWithCommas(this.totalClips);                      
                        this.clipsData = items;
                        // this.totalClipsSummary = this.getTotalSummary(this.clipsData);
                        this.totalClipsSummary = this.summarizeClips(items)
                    });
                }
            });
    }
    summarizeClips(clips) {
        let commercial = 0;
        let editorial = 0;
        let fourK = 0;
        let hd = 0;
        let lessthanhd = 0;
        let rating = 0;

        for (let i=0; i<clips.length; i++) {
            if (clips[i].userFields['user.27'] === '1280x720') {
                lessthanhd += 1;
            } else if (clips[i].userFields['user.27'] === '1920x1080') {
                hd += 1;
            } else if (clips[i].userFields['user.27'] === '3840x2160') {
                fourK += 1;
            } else if (clips[i].userFields['user.27'] === '4096x2160') {
                fourK += 1;
            }
        }

        for (let i=0; i<clips.length; i++) {
            if (clips[i].userFields['user.24'] === 'Editorial') {
                editorial += 1;
            } else if (clips[i].userFields['user.24'] === 'Commercial') {
                commercial += 1;
            }
        }
        let clips_with_ratings = 0;
        for (let i=0; i<clips.length; i++) {
            if (clips[i].rating >= 0) {
                rating += clips[i].rating;
                clips_with_ratings += 1;
            }
        }
        let final_rating;
        clips_with_ratings === 0 ? final_rating = 0 : final_rating = rating / (clips_with_ratings)
        let clips_summary = {
            commercialClipCount: commercial,
            editorialClipCount: editorial,
            fourKClipCount: fourK,
            hdClipCount: hd,
            lessThanHdClipCount: lessthanhd,
            rating: final_rating
        }
        return clips_summary;
    }
    refreshSalesData() {
        const userId = this.user && this.user.selectedUser ? this.user.selectedUser.id : null;
        return this.httpClient
            .fetch('/sales/summaries/current' + (userId ? `?userId=${userId}` : ''), {
                method: 'get',
                mode: 'cors'
            }).then(resp => {
                if (resp.ok) {
                    resp.json().then(o => {
                        this.salesData = o;
                        this.totalSalesSummary = this.getTotalSummary(this.salesData);
                    });
                }
            });
    }

    refreshShotSuggestionsData() {
        const userId = this.user && this.user.selectedUser ? this.user.selectedUser.id : null;
        return this.httpClient
            .fetch('/shotSuggestions' + (userId ? `?userId=${userId}` : ''), {
                method: 'get',
                mode: 'cors'
            })
            .then(resp => {
                if (resp.ok) {
                    resp.json().then(o => {
                        this.shotSuggestionsData = o;
                    });
                }
            });
    }
}