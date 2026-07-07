class PipelineReporter{
    constructor(){
        this.events = [];
        this.startTime = Date.now();
    }

    emit(event,data = {}){
        this.events.push({
            event,
            data,
            timestamp: Date.now()
        })
    }

    getReport(){
        return {
            events: this.events,
            totalTime: Date.now() - this.startTime
        }
    }
}

export default PipelineReporter;