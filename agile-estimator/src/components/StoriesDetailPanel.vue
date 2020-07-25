<template>
  <div>
    <md-toolbar layout="row" theme="black-green-light" class="accent md-dense">
      <h1 class="md-title md-toolbar-section-start ">Story Details</h1>
      <p class="md-toolbar-section-start padding-instr">(Click on the column to edit)</p>
      <h6 class="md-toolbar-section-end">{{story.final_estimate}}</h6>
    </md-toolbar>
    <md-table>
      <md-table-row v-if="!isNaN(index)" v-for="(storyColumn,index) in story">
        <md-table-cell class="header-name right-border" >{{ storyColumn.header}}</md-table-cell>
        <md-table-cell class="column-value" >
          <div style="float:left;width:100%;height:100%" v-on:click="toggleEdit(index)" >
            <p v-show="!viewData[index]">{{storyColumn.value}}</p>
          </div>
          <textarea-autosize
            class="editable-column"
                             v-show="viewData[index]"
                             ref="columnValue"
                             v-model="storyColumn.value"
                             :min-height="30"
                             :max-height="350"
                             @blur.native="afterLeave(index)"/>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

export default {
  name: 'StoriesDetailPanel',
  data () {
    return {
      viewData: [],
      story: {}
    }
  },
  watch: {
    storyId: function () {
      this.storyIdChange()
    }
  },
  mounted: function () {
    this.storyIdChange()
  },
  components: {},
  props: ['session-id', 'storyId'],
  methods: {
    storyIdChange: function () {
      if (this.story !== null && this.story !== undefined) {
        for (let i = 0; i < Object.keys(this.story).length; i++) {
          this.viewData[i] = false
        }
      }
      let estimatorSessionId = this.$route.params.id
      let that = this
      firebase.database().ref('estimators/' + estimatorSessionId + '/stories/' + this.storyId)
        .on('value', function (storieRef) {
          that.story = storieRef.val()
        })
    },
    toggleEdit: function (index) {
      let changedTo = !this.viewData[index]
      this.$set(this.viewData, index, changedTo)
      if (changedTo && this.$refs.columnValue[index] !== undefined) {
        setTimeout(() =>
          this.$refs.columnValue[index].$el.focus(), 50)
      }
    },
    afterLeave: function (index) {
      this.toggleEdit(index)
      this.saveData()
    },
    saveData: function () {
      let estimatorSessionId = this.$route.params.id
      firebase.database().ref('estimators/' + estimatorSessionId + '/stories/' + this.storyId)
        .set(this.story)
    }
  }
}
</script>

<style lang="css" scoped>
  .story-list-item:nth-child(even) {
    background-color: #2c3e50;
    color:white;
  }

  .story-list-item:nth-child(odd) {
    background-color: #424242;
  }

  .header-name{
    width:30%
  }
  .column-value{
    width:70%
  }
  .editable-column{
    width:100%;
  }
  .padding-instr{
    padding-top: 12px;
    margin-left: -94px;
  }
  .accent{
    background-color: #986534;
  }
  .right-border{
    border-right: solid 5px gray;
  }
</style>
