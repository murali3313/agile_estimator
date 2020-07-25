<template>
  <div>
    <md-toolbar  layout="row" theme="black-green-light" class=" accent md-dense">
      <h1 class="md-title md-toolbar-section-start md-toolbar-offset">Story list</h1>
      <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1 btn-accent"
             v-on:click="showStoriesDisplaySettings = true">
        Settings
      </md-button>
      <md-button class="md-toolbar-section-end md-alignment-top-center md-elevation-1 btn-accent"
                 @click="$emit('clearFilter')">
        {{'Filter: '+(applyFilter=='' ? 'NA':applyFilter)}}
      </md-button>
    </md-toolbar>
    <md-table class="md-fixed-header">
      <md-table-row class="table-header-accent">

        <md-table-cell class="md-table-cell right-border" v-for="(columnNumber) in stories.storyConfig.displayColumnNumbers"
                       v-bind:key="columnNumber">
          <strong v-if="stories.storyConfig.headerColumnValues[columnNumber]">
          {{stories.storyConfig.headerColumnValues[columnNumber].toUpperCase()}}
          </strong>
        </md-table-cell>
        <md-table-cell><strong>SIZE</strong></md-table-cell>
      </md-table-row>
      <md-table-row v-for="(story,storyId) in stories"
                    v-bind:key="storyId"
                    v-bind:class="storyId === currentStoryId? 'row-selected-story':''"
                    @click="showDetail(story,storyId)"
                    v-if="storyId!=='storyConfig' &&( applyFilter=='' || story.final_estimate === applyFilter)">
        <md-table-cell v-for="(columnNumber) in stories.storyConfig.displayColumnNumbers"
                       v-bind:key="columnNumber"
                        class="right-border">
          {{getColumnValue(story[columnNumber])}}

        </md-table-cell>
        <md-table-cell>
          <div v-bind:class="isFinalEstimatePresent(story) ? story.final_estimate +' estimated md-elevation-4': ''"
               @click="viewEstimate()">
            {{story.final_estimate}}
          </div>

        </md-table-cell>
      </md-table-row>
    </md-table>
    <StoriesDisplaySettings :display="showStoriesDisplaySettings"
                            @close="showStoriesDisplaySettings = false"
                            :storyConfig="stories['storyConfig']">

    </StoriesDisplaySettings>
  </div>
</template>

<script>
import StoriesDisplaySettings from './StoryDisplaySettings'

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
  props: ['sessionId', 'lockMoving', 'applyFilter','currentStoryId'],
  methods: {
    isFinalEstimatePresent: function (story) {
      return window.util.isNotEmpty(story.final_estimate)
    },
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

  .estimated{
    border-radius: 50%;
    height: 40px;
    width: 40px;
    padding-top:13px;
    color: white;
    font-size: large;
    font-style: oblique;
  }

  .XS {
    background-color: #efe9cf;
    color:black;

  }

  .S {
    background-color: #e2d6ab;
    color:black;
  }

  .M {
    background-color: #ddbe9b;
    color:black;
  }

  .L {
    background-color: #be9f44;
    color:black;
  }

  .XL {
    background-color: #be7f41;
    color:black;
  }

  .XXL {
    background-color: #986534;
    color:black;

  }
  .accent{
    background-color: #986534;
  }
  .btn-accent{
    background-color: #724c27;
  }
  .table-header-accent{
    background-color: #c48b54;
  }
  .right-border{
    border-right: solid 1px gray;
  }
  .row-selected-story{
    background-color: #724c27
  }
</style>
