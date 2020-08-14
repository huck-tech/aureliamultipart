import {bindable, inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import config from 'app-config';

@inject(HttpClient)
export class ShotSuggestionManager {
    
    @bindable allSuggestions;
    @bindable suggestedShots = [];
    @bindable isBusy = false;

    shotsChangedHandlers = [];

    constructor(httpClient) {
        this.id = Math.random();
        this.created = new Date();

        this.httpClient = httpClient;
        this.allSuggestions = {};
        this.loadShots();
    }

    addShotsChangedHandler(handler) {
        this.shotsChangedHandlers.push(handler);
        return this.shotsChangedHandlers.length - 1;
    }

    removeShotsChangedHandler(index) {
        this.shotsChangedHandlers.splice(index, 1);
    }

    invokeShotsChangedHandlers(changes) {
        this.shotsChangedHandlers.forEach(h => h(changes));
    }

    loadShots() {
        // indicate busy while loading
        this.isBusy = true;

        // clear collection
        this.suggestedShots.splice(0, this.suggestedShots.length);

        // call API to get suggested shots for the current user
        // this.httpClient.fetch('/shotSuggestions', {
        this.httpClient.fetch(config.contributorApiUrls.userShotSuggestions, {
            mode: 'cors',
            method: 'get'
        }).then(response => {
            if (response.ok) {
                // convert to json and push items to collection
                return response.json().then(shots => {
                    for (let i = 0; i < shots.length; i++) {
                        this.suggestedShots.push(shots[i]);
                    }
                });
            }
        });
    }

    loadCategoryShots(categoryName) {
        // check if already populated
        if (this.allSuggestions.hasOwnProperty(categoryName)) return Promise.resolve();

        // indicate busy while loading
        this.isBusy = true;

        // create new array if not populated
        this.allSuggestions[categoryName] = [];

        return this.httpClient
            // .fetch('/shotSuggestions/' + categoryName, {
            .fetch(config.infoUrls.shotsuggestionUrl, {
                mode: 'cors',
                method: 'post',
                body: json({
                    category_name : categoryName
                })
            })
            .then(resp => {
                // no longer loading
                this.isBusy = false;

                // add suggestions to loaded collection
                if (resp.ok) {
                    return resp.json().then(data => data.results.forEach(d => this.allSuggestions[categoryName].push(d)));
                }
            });
    }

    getCategoryUnsuggestedShots(categoryName) {
        // if the category hasn't been loaded, we can't really do anything here
        if (!this.allSuggestions[categoryName]) return [];

        // filter category shots for shots that have not been added to the user's list
        return this.allSuggestions[categoryName].filter(s => !this.isShotAlreadyAdded(s));
    }

    isShotAlreadyAdded(shot) {
        // try to match on id
        for (let i = 0; i < this.suggestedShots.length; i++) {
            if (this.suggestedShots[i].id === shot.id) {
                return true;
            }
        }

        // didn't find any matches
        return false;
    }

    addShot(shot) {
        // only add if not already added
        console.log('to add')
        if (this.isShotAlreadyAdded(shot)) return;
        console.log('adding', shot)
        // indicate we're busy while adding
        this.isBusy = true;

        // call API to add suggestion
        this.httpClient.fetch(config.contributorApiUrls.userShotSuggestions, {
            mode: 'cors',
            method: 'post',
            body: json({
                shot_id: shot.id,
                description: shot.description
            })
        }).then(resp => {
            // finished - stop showing busy
            this.isBusy = false;

            // add to the in-memory collection
            if (resp.ok) {
                this.suggestedShots.push(shot);
                this.invokeShotsChangedHandlers({ added: shot });
            }
        });
    }

    removeShot(shot) {
        console.log('to remove')
        if (!this.isShotAlreadyAdded(shot)) return;
        console.log('removing', shot)
        // ensure the shot exists in the collection
        const index = this.suggestedShots.indexOf(shot);
        if (index < 0) return;

        // doing delete - indicate we're busy
        this.isBusy = true;

        // call API to remove the shot suggestion
        // this.httpClient.fetch('/shotSuggestions?shotId=' + shot.id, {

        const removeId = (shot.shot_id === undefined) ? shot.id : shot.shot_id;

        this.httpClient.fetch(config.contributorApiUrls.userShotSuggestions + removeId + "/", {
            mode: 'cors',
            method: 'delete'
        }).then(resp => {
            // finished - stop showing busy
            this.isBusy = false;

            // remove from the in-memory collection
            if (resp.ok) {
                return resp.json().then(data => {
                        shot.categories = data.categories;
                        // console.log(shot);
                        this.suggestedShots.splice(index, 1);
                        this.invokeShotsChangedHandlers({ removed: shot });        
                    }
                )
                // console.log(shot.categories);
                // this.suggestedShots.splice(index, 1);
                // this.invokeShotsChangedHandlers({ removed: shot });
            }
        });
    }
}