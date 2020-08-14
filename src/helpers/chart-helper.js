import 'amcharts/dist/amcharts/amcharts';
import 'amcharts/dist/amcharts/pie';


export class ChartHelper {

    constructor() {
        this.amCharts = window.AmCharts;
        
        this.amChart = {
            color: '#ffffff',
            backgroundColor: '#17171e'
        };

        this.amCoordinateChart = {
            colors: ['#F7931D', '#61c2c2', '#DDDDDD', '#999999', '#333333', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25']
        };
        
        this.amStockChart = {
            colors: ['#F7931D', '#61c2c2', '#DDDDDD', '#999999', '#333333', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25']
        };

        this.amRectangularChart = {
            zoomOutButtonColor: '#000000',
            zoomOutButtonRollOverAlpha: 0.15,
            zoomOutButtonImage: 'lens'
        };

        this.axisBase = {
            axisColor: '#000000',
            axisAlpha: 0.3,
            gridAlpha: 0.1,
            gridColor: '#000000'
        };

        this.chartScrollbar = {
            backgroundColor: '#000000',
            backgroundAlpha: 0.12,
            graphFillAlpha: 0.5,
            graphLineAlpha: 0,
            selectedBackgroundColor: '#17171e',
            selectedBackgroundAlpha: 0.4,
            gridAlpha: 0.15
        };

        this.chartCursor = {
            cursorColor: '#17171e',
            color: '#17171e',
            cursorAlpha: 0.5
        };

        this.amLegend = {
            color: '#ffffff'
        };

        this.amGraph = {
            lineAlpha: 0.9
        };

        this.gaugeArrow = {
            color: '#ffffff',
            alpha: 0.8,
            nailAlpha: 0,
            innerRadius: '40%',
            nailRadius: 15,
            startWidth: 15,
            borderAlpha: 0.8,
            nailBorderAlpha: 0
        };

        this.gaugeAxis = {
            tickColor: '#ffffff',
            tickAlpha: 1,
            tickLength: 15,
            minorTickLength: 8,
            axisThickness: 3,
            axisColor: '#17171e',
            axisAlpha: 1,
            bandAlpha: 0.8
        };

        this.trendLine = {
            lineColor: '#c03246',
            lineAlpha: 0.8
        };

        // ammap
        this.areasSettings = {
            alpha: 0.8,
            color: '#67b7dc',
            colorSolid: '#003767',
            unlistedAreasAlpha: 0.4,
            unlistedAreasColor: '#17171e',
            outlineColor: '#17171e',
            outlineAlpha: 0.5,
            outlineThickness: 0.5,
            rollOverColor: '#3c5bdc',
            rollOverOutlineColor: '#17171e',
            selectedOutlineColor: '#17171e',
            selectedColor: '#f15135',
            unlistedAreasOutlineColor: '#17171e',
            unlistedAreasOutlineAlpha: 0.5
        };

        this.linesSettings = {
            color: '##17171e',
            alpha: 0.8
        };

        this.imagesSettings = {
            alpha: 0.8,
            labelColor: '#17171e',
            color: '#17171e',
            labelRollOverColor: '#3c5bdc'
        };

        this.zoomControl = {
            buttonFillAlpha: 0.7,
            buttonIconColor: '#a7a7a7'
        };

        this.smallMap = {
            mapColor: '#17171e',
            rectangleColor: '#f15135',
            backgroundColor: '#17171e',
            backgroundAlpha: 0.7,
            borderThickness: 1,
            borderAlpha: 0.8
        };
    }
    
    setTheme() {

        if (!this.amCharts.themes.clippn) {
            this.amCharts.themes.clippn = this.createNewTheme('clippn');
            this.amCharts.themes.clippn.AmSlicedChart = {
                colors: ['#599bd7', '#40a31f', '#f0ad4e', '#6e288b', '#cc3333', '#3a56c2', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25'],
                outlineAlpha: 0,
                outlineThickness: 2,
                labelTickColor: '#ffffff',
                labelTickAlpha: 1.0
            };
        }

        if (!this.amCharts.themes.clippnDisabled) {
            this.amCharts.themes.clippnDisabled = this.createNewTheme('clippnDisabled');
            this.amCharts.themes.clippnDisabled.AmSlicedChart = {
                colors: ['#273c50', '#294220', '#543c1b', '#6e288b', '#cc3333', '#3a56c2', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25'],
                outlineAlpha: 0,
                outlineThickness: 2,
                labelTickColor: '#ffffff',
                labelTickAlpha: 1.0
            };
        }

        if (!this.amCharts.themes.clippn2) {
            this.amCharts.themes.clippn2 = this.createNewTheme('clippn2');
            this.amCharts.themes.clippn2.AmSlicedChart = {
                colors: ['#6e288b', '#cc3333', '#3a56c2', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25', '#599bd7', '#40a31f', '#f0ad4e'],
                outlineAlpha: 0,
                outlineThickness: 2,
                labelTickColor: '#ffffff',
                labelTickAlpha: 1.0
            };
        }

        if (!this.amCharts.themes.clippn2Disabled) {
            this.amCharts.themes.clippn2Disabled = this.createNewTheme('clippn2Disabled');
            this.amCharts.themes.clippn2Disabled.AmSlicedChart = {
                colors: ['#30123c', '#440d0d', '#3a56c2', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25', '#599bd7', '#40a31f', '#f0ad4e'],
                outlineAlpha: 0,
                outlineThickness: 2,
                labelTickColor: '#ffffff',
                labelTickAlpha: 1.0
            };
        }

        if (!this.amCharts.isReady)
            this.amCharts.isReady = true;
    }

    createNewTheme(name) {
        return {
            themeName: name,
            AmChart: this.amChart,
            AmCoordinateChart: this.amCoordinateChart,
            AmStockChart: this.amStockChart,
            AmRectangularChart: this.amRectangularChart,
            AxisBase: this.axisBase,
            ChartScrollbar: this.chartScrollbar,
            ChartCursor: this.chartCursor,
            AmLegend: this.amLegend,
            AmGraph: this.amGraph,
            GaugeArrow: this.gaugeArrow,
            GaugeAxis: this.gaugeAxis,
            TrendLine: this.trendLine,
            AreasSettings: this.areasSettings,
            LinesSettings: this.linesSettings,
            ImagesSettings: this.imagesSettings,
            ZoomControl: this.zoomControl,
            SmallMap: this.smallMap
        };
    }
}