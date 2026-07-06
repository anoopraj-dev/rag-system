class AIProvider {
    async generate(request){
        throw new Error('generate() must be implemented');
    }
}

export default AIProvider;