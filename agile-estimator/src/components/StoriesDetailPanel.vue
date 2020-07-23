<template>
  <div class="container-fluid ">
    <div class="row">
      <h4>Story details</h4>
      <h6 class="pad-instr">(Click on the column to edit values)</h6>
    </div>
    <div class="row story-list-item" v-if="!isNaN(index)" v-for="(storyColumn,index) in story">
      <div class="col-md-5"> {{ storyColumn.header}}</div>
      <div class="col-md-7" v-show="!viewData[index]" v-on:click="toggleEdit(index)" >
        {{storyColumn.value}}
      </div>
      <textarea-autosize class="col-md-7"
                         v-show="viewData[index]"
                         ref="columnValue"
                         v-model="storyColumn.value"
                         :min-height="30"
                         :max-height="350"
                         @blur.native="afterLeave(index)"/>
    </div>
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
    storyId: function () { this.storyIdChange() }
  },
  mounted: function () { this.storyIdChange() },
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
  .story-list-item {
    width: 100%;
  }

  .story-list-item:nth-child(even) {
    background-color: beige;
  }

  .story-list-item:nth-child(odd) {
    background-color: burlywood;
  }
  .pad-instr{
    padding-top: 5px;
    padding-left: 10px;
  }
</style>
