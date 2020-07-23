<template>
  <div class="container-fluid">
    <div class="row bg-primary text-light heading">
      <h4 class=" col-md-8 ">Story list</h4>
      <img :src="require('../assets/settings.png')" class="settings"
           v-on:click="showStoriesDisplaySettings = true">
      <input type="button" class="btn apply-filter"
             v-bind:value="'Filter: '+(applyFilter === '' ? 'NA':applyFilter)" @click="$emit('clearFilter')"/>
    </div>
    <div class="story-list-item row">
      <div class="col-md-11">
        <div class="container-fluid">
          <div class="row">
            <div v-for="(columnNumber) in stories.storyConfig.displayColumnNumbers" class="col-md-4">
              {{stories.storyConfig.headerColumnValues[columnNumber]}}
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-1">Size</div>
    </div>
    <div class="main">
      <div class="wrapper">
        <div v-for="(story,storyId) in stories" v-if="applyFilter=='' || story.final_estimate === applyFilter"
             class="story-list-item row" @click="showDetail(story,storyId)">
          <div class="col-md-11">
            <div class="container-fluid">
              <div class="row">
                <div v-for="(columnNumber) in stories.storyConfig.displayColumnNumbers" class="col-md-4">
                  {{getColumnValue(story[columnNumber])}}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-1 estimated"
               @click="viewEstimate()"
               v-if="story.final_estimate !== undefined && story.final_estimate !== null && story.final_estimate !== ''">
            {{story.final_estimate}}
          </div>
        </div>
      </div>
    </div>
    <StoriesDisplaySettings :display="showStoriesDisplaySettings"
                            @close="showStoriesDisplaySettings = false"
                            :storyConfig="stories['storyConfig']">

    </StoriesDisplaySettings>
  </div>
</template>

<script>
import StoriesDisplaySettings from './StoryDisplaySettings'

const $ = require('jquery')
export default {
  mounted: function () {
    let that = this
    if (this.sessionId !== null && this.sessionId !== undefined) {
      firebase.database().ref('estimators/' + this.sessionId + '/stories')
        .on('value', function (storieRef) {
          that.stories = storieRef.val()
        })
    }
  },
  name: 'StoriesDisplayPanel',
  data () {
    return {
      stories: {storyConfig: {}},
      showStoriesDisplaySettings: false
    }
  },
  components: {StoriesDisplaySettings},
  props: ['sessionId', 'lockMoving', 'applyFilter'],
  methods: {
    getColumnValue: function (column) {
      return (column !== null && column !== undefined) ? column.value : ''
    },
    showDetail: function (story, storyId) {
      if (!this.lockMoving) {
        this.$emit('viewDetail', story, storyId)
      }
    },
    viewEstimate: function () {
      if (!this.lockMoving) {
        this.$emit('showEstimation')
      }
    }
  }
}
</script>

<style lang="css" scoped>
  .story-list-item {
    width: 100%;
  }

  .story-list-item:nth-child(even) {
    background-color: beige;
  }

  .story-list-item:nth-child(odd) {
    background-color: burlywood;
  }

  .settings {
    cursor: pointer;
    width: 30px;
    height: 30px;
  }

  .all-story {
    height: auto;
    overflow-y: auto;
  }

  .heading {
    margin-right: 15px;
  }

  .wrapper {
    float: left;
    overflow-y: auto; /* new */
    height: 100%;
    width: 100%;
  }

  .main {
    margin: 0;
    height: 100%;
  }

  .estimated {
    background-color: #42b983;
    border-radius: 50%;
    height: 30px;
    width: 20px;
    margin-top: 10px;
    color: white;
    font-size: large;
    font-style: oblique;
  }

  .apply-filter {
    color: white;
  }
</style>
