import {inject, bindable} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-binding';
import {ChartHelper} from 'helpers/chart-helper';
import 'amcharts/dist/amcharts/amcharts';
import 'amcharts/dist/amcharts/pie';

@inject(ChartHelper, BindingEngine)
export class SummaryChart {

    // DATA EXAMPLE:
    //[
    //    {
    //        'title': 'Ideation',
    //        'value': 40
    //    }, {
    //        'title': 'Iteration',
    //        'value': 30
    //    }, {
    //        'title': 'Coding',
    //        'value': 20
    //    }
    //]
    
    @bindable header;
    @bindable config;
    @bindable data;
    @bindable values;

    @bindable noData = false;

    constructor(chartHelper, bindingEngine) {
        this.chartHelper = chartHelper;
        this.bindingEngine = bindingEngine;

        this.amCharts = window.AmCharts;

        this.chartHelper.setTheme();

        this.dataSubscription = bindingEngine.propertyObserver(this, 'data').subscribe(() => this.makeChart());
    }

    bind() {
        this.makeChart();
    }

    makeChart() {

        if (!this.data || !document.getElementById(this.config.chartTagName)) {
            setTimeout(() => this.makeChart(), 250);
            return;
        }

        this.values = this.processData();

        this.chart = this.amCharts.makeChart(this.config.chartTagName, {
            'type': 'pie',
            'startDuration': 0.5,
            'startEffect': '>',
            'startRadius': '100%',
            'radius':'50',
            'pullOutRadius': 0,
            'theme': this.noData ? this.config.disabledTheme : this.config.theme,
            'addClassNames': true,
            'labelsEnabled': false,
            'legend': {
                'showEntries': false,
                'position': 'right',
                'autoMargins': true,
                'switchable': false,
            },
            'innerRadius': '30%',
            'dataProvider': this.values,
            'valueField': 'amount',
            'titleField': 'type',
            'export': {
                'enabled': true
            }
        });

        this.chart.addListener('init', this.handleInit);
        this.chart.addListener('rollOverSlice', this.handleRollOver);
    }

    processData() {
        if (!this.config.valueProperties) {
            console.error('No config specified.');
            return;
        }

        let foundData = false;

        const values = [];
        for (let i = 0; i < this.config.valueProperties.length; i++) {
            const propData = this.config.valueProperties[i];
            const value = this.data[propData.propertyName];

            if (value)
                foundData = true;

            values.push({ type: propData.displayName ? propData.displayName : propData.propertyName, amount: value });
        }

        this.noData = !foundData;

        if (this.noData) {
            // set all values to 1 for an evenly-distributed graph
            for (let i = 0; i < this.config.valueProperties.length; i++)
                values[i].amount = 1;
        }

        return values;
    }

    handleInit() {
        this.chart.legend.addListener('rollOverItem', handleRollOver);
    }

    handleRollOver(e) {
        let wedge = e.dataItem.wedge.node;
        wedge.parentNode.appendChild(wedge);  
    }
}