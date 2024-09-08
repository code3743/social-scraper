class Post {

    /**
     * 
     * @param {string} id 
     * @param {string} content 
     * @param {string[]} media 
     * @param {object} metadata 
     */
    constructor(id,content, media, metadata) {
        this.id = id;
        this.content = content;
        this.media = media;
        this.metadata = metadata;
    }


    toJSON() {
        return {
            id: this.id,
            content: this.content,
            media: this.media,
            metadata: this.metadata
        };
    }
}

module.exports = Post;