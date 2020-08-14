import $ from 'jquery';

export class MultiStepModal {

    constructor(){
        this.current = 1;
        this.resetHandlers = [];
    }
    
    get percentComplete() {
        return Math.min(this.current / this.totalNumSteps * 100, 100) + '%';
    }

    initialize(id) {
        this.modal = $('#' + id);
        this.buttons = this.modal.find('button.step');
        this.totalNumSteps = this.buttons.length - 2;
        this.progress = this.modal.find('.m-progress');
        this.progressBar = this.modal.find('.m-progress-bar');
        this.progressStats = this.modal.find('.m-progress-stats');
        this.progressCurrent = this.modal.find('.m-progress-current');
        this.progressTotal = this.modal.find('.m-progress-total');
        this.progressComplete = this.modal.find('.m-progress-complete');
        this.resetOnClose = this.modal.attr('reset-on-close') === 'true';

        this.clear();
        this.updateProgress(1);
        this.modal.find('.step-1').show();
        this.progressComplete.hide();
        this.progressTotal.text(this.totalNumSteps);
        this.bindEventsToModal();
        this.modal.data({
            totalNumSteps: this.buttons.length
        });
        
        if (this.resetOnClose) {
            this.modal.on('hidden.bs.modal', () =>  setTimeout(() => this.reset(), 250));
        }
    }

    addResetHandler(handler) {
        this.resetHandlers.push(handler);
    }

    reset() {
        this.goToStep(1);

        for (let i = 0; i < this.resetHandlers.length; i++)
            this.resetHandlers[i]();
    }

    clear() {
        this.modal.find('.step').hide();
        this.modal.find('[data-step]').hide();
    }

    completeSteps() {
        this.progressStats.hide();
        this.progressComplete.show();
        this.modal.find('.progress-text').animate({
            top: '-2em'
        });
        this.modal.find('.complete-indicator').animate({
            top: '-2em'
        });
        this.progressBar.addClass('completed');
    }

    updateProgress() {
        this.progressBar.animate({
            width: this.percentComplete
        });
        if (this.current - 1 >= this.totalNumSteps) {
            this.completeSteps();
        } else {
            this.progressCurrent.text(this.current);
        }

        this.progress.find('[data-progress]').each(function() {
            var dp = $(this);
            if (dp.data().progress <= current - 1) {
                dp.addClass('completed');
            } else {
                dp.removeClass('completed');
            }
        });
    }

    findFirstFocusableInput(parent) {
        var candidates = [
            parent.find('input'),
            parent.find('select'),
            parent.find('textarea'),
            parent.find('button')
        ];

        var winner = parent;

        $.each(candidates, function() {
            if (this.length > 0) {
                winner = this[0];
                return false;
            }
            return true;
        });

        return $(winner);
    }

    goToStep(step) {
        if (this.canGoToStep && !this.canGoToStep(step, this.current))
            return;

        this.clear();
        var toShow = this.modal.find('.step-' + step);
        if (toShow.length === 0) {
            // at the last step, nothing else to show
            return;
        }
        toShow.show();
        this.current = parseInt(step, 10);
        this.updateProgress();
        this.findFirstFocusableInput(toShow).focus();
    }

    moveNext() {
        if (this.current + 1 <= this.totalNumSteps)
            this.goToStep(this.current + 1);
    }

    movePrevious() {
        if (this.current - 1 >= 1)
            this.goToStep(this.current - 1);
    }

    bindEventsToModal() {
        var dataSteps = [];
        $('[data-step]').each(function() {
            var step = $(this).data().step;
            if (step && $.inArray(step, dataSteps) === -1) {
                dataSteps.push(step);
            }
        });
    }
}