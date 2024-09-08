class Post {
    /**
     * Creates an instance of the Post class.
     * @param {string} id - The unique identifier for the post.
     * @param {string} content - The text content of the post.
     * @param {string[]} media - An array of URLs pointing to media (e.g., images, videos) associated with the post.
     * @param {object} metadata - Additional metadata for the post (e.g., timestamp, author, etc.).
     */
    constructor(id, content, media, metadata) {
        this.id = id;
        this.content = content;
        this.media = media;
        this.metadata = metadata;
    }

    /**
     * Converts the Post instance to a plain JSON object.
     * Useful when saving or exporting the data to a JSON file.
     * @returns {{id: string, content: string, media: string[], metadata: object}} A JSON representation of the Post instance.
     */
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
