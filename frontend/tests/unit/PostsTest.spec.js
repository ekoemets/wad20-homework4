import {mount, createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Posts from "../../src/components/Posts.vue";
import moment from 'moment';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

//Create dummy store
const store = new Vuex.Store({
    state: {
        user: {
            id: 1,
            firstname: 'test',
            lastname: 'test',
            email: 'test',
            avatar: 'test',
        }
    },
    getters: {
        user: (state) => state.user,
    }
});

//Create dummy routes
const routes = [
    {
        path: '/',
        name: 'posts',
    },
    {
        path: '/profiles',
        name: 'profiles'
    }
];

const router = new VueRouter({routes});

const testData = [
    {
        id: 1,
        text: "I think it's going to rain",
        createTime: "2020-12-05 13:53:23",
        likes: 0,
        liked: false,
        media: {
            url: "test-image.jpg",
            type: "image"
        },
        author: {
            id: 2,
            firstname: "Gordon",
            lastname: "Freeman",
            avatar: 'avatar.url'
        }
    },
    {
        id: 2,
        text: "Which weighs more, a pound of feathers or a pound of bricks?",
        createTime: "2020-12-05 13:53:23",
        likes: 1,
        liked: true,
        media: null,
        author: {
            id: 3,
            firstname: "Sarah",
            lastname: "Connor",
            avatar: 'avatar.url'
        }
    },
    {
        id: 4,
        text: null,
        createTime: "2020-12-05 13:53:23",
        likes: 3,
        liked: false,
        media: {
            url: "test-video.mp4",
            type: "video"
        },
        author: {
            id: 5,
            firstname: "Richard",
            lastname: "Stallman",
            avatar: 'avatar.url'
        }
    }
];

//Mock axios.get method that our Component calls in mounted event
jest.mock("axios", () => ({
    get: () => Promise.resolve({
        data: testData
    })
}));

describe('Posts', () => {

    const wrapper = mount(Posts, {router, store, localVue});

    it('correct amount of posts are rendered', function () {
        let posts = wrapper.findAll('.post');
        expect(posts.length).toBe(testData.length)
    });

    it('correctly renders image or video if media property is present otherwise does not', function () {
        let posts = wrapper.findAll('.post');
        // We expect posts to rendered in the same order as they are passed in
        testData.forEach((testPost, i) => {
            let post = posts.at(i);
            const postImage = post.find('.post-image');
            if (!testPost.media) {
                // Make sure no the container for media is rendered
                expect(postImage.exists()).toBe(false);
            } 
            else {
                // Make sure the container for media is rendered
                expect(postImage.exists()).toBe(true);

                // Make sure it contains correct link
                expect(postImage.html()).toContain(testPost.media.url);

                // Make sure correct type of media is rendered
                if (testPost.media.type === 'image') {
                    expect(postImage.find('img').exists()).toBe(true);
                }
                else if (testPost.media.type === 'video'){
                    expect(postImage.find('video').exists()).toBe(true);
                }
            }
        })
    });


    it('displays create time in correct format', function() {
        let posts = wrapper.findAll('.post');
        testData.forEach((testPost, i) => {
            let post = posts.at(i);
            let dateContainer = post.find('.post-author');

            // Create correctly formatted date
            let testDate = moment(testPost.createTime, 'YYYY-MM-DD hh:mm:ss');
            let correctDate = testDate.format('dddd, MMMM D, YYYY h:mm A')

            // Check that container exists and it includes correctly formatted date
            expect(dateContainer.exists()).toBe(true);
            expect(dateContainer.html()).toContain(correctDate);
        })
    });
});