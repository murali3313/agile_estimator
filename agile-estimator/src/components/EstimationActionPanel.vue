<template>
  <div>
    <md-toolbar theme="black-green-light" class="accent md-dense">
      <h5 class="md-title md-toolbar-section-start ">{{activateEstimation?'Wats ur estimate?':'Reference Stories'}}</h5>
    </md-toolbar>
    <div class="point-out">
      <img :src="require('../assets/estimate.gif')" class="point-out" v-if="activateEstimation"/>
    </div>
    <md-table v-bind:class="{'activate': activateEstimation}">
      <md-table-row>
        <div class="row">
          <h4 v-if="activateEstimation" class="estimate"> {{estimation}}</h4>
          <div></div>
        </div>
      </md-table-row>
      <md-table-row>
        <div class="row">
          <div class="xs md-elevation-4" v-on:click="estimate('XS')">XS</div>
        </div>
      </md-table-row>
      <md-table-row>
        <div class="row">
          <div class="s md-elevation-4" v-on:click="estimate('S')">S</div>
        </div>
      </md-table-row>
      <md-table-row>
        <div class="row">
          <div class="m md-elevation-4" v-on:click="estimate('M')">M</div>
        </div>
      </md-table-row>
      <md-table-row>
        <div class="row">
          <div class="l md-elevation-4" v-on:click="estimate('L')">L</div>
        </div>
      </md-table-row>
      <md-table-row>
        <div class="row">
          <div class="xl md-elevation-4" v-on:click="estimate('XL')">XL</div>
        </div>
      </md-table-row>
      <md-table-row>
        <div class="row">
          <div class="xxl md-elevation-4" v-on:click="estimate('XXL')">XXL</div>
        </div>
      </md-table-row>
    </md-table>
    <img :src="require('../assets/agile-estimator.png')"/>
  </div>
</template>

<script>
export default {
  name: 'EstimationActionPanel',
  data () {
    return {
      activateEstimation: false,
      estimatorSessionId: '',
      estimation: ''
    }
  },
  components: {},
  props: ['storyId', 'displayEstimation'],
  methods: {
    estimate: function (estimation) {
      this.estimatorSessionId = this.$route.params.id
      this.estimation = estimation
      if (this.activateEstimation) {
        firebase.database()
          .ref('estimators/' + this.estimatorSessionId + '/stories/' + this.storyId + '/user_estimates/' + SessionStorageUtil.getUserName())
          .set(estimation)
      } else {
        this.$emit('applyFilter', estimation)
      }
    }
  },
  mounted: function () {
    this.activateEstimation = window.util.isNotEmpty(this.storyId)
  },
  watch: {
    storyId: function () {
      this.activateEstimation = window.util.isNotEmpty(this.storyId)
      this.estimation = ''
    }
  }
}
</script>

<style lang="css" scoped>
  .row {
    padding: 10px;
  }

  .estimate {
    display: inline-block;
    margin: 0 auto;
    width: 100px;
    padding: 2px;
    border-radius: 1%;
    background-color: #458aff;
    cursor: pointer;
    color: white;
    min-height: 30px;
  }

  .xs, .s, .m, .l, .xl, .xxl {
    display: inline-block;
    margin: 0 auto;
    border-radius: 50%;
    cursor: pointer;
    color: black;
  }

  .xs {
    height: 2em;
    width: 2em;
    line-height: 2em;
    background-color: #efe9cf;

  }

  .s {
    height: 3em;
    width: 3em;
    line-height: 3em;
    background-color: #e2d6ab;
  }

  .m {
    height: 4em;
    width: 4em;
    line-height: 4em;
    background-color: #ddbe9b;
  }

  .l {
    height: 5em;
    width: 5em;
    line-height: 5em;
    background-color: #be9f44;
  }

  .xl {
    height: 5.5em;
    width: 5.5em;
    line-height: 5.5em;
    background-color: #be7f41;
  }

  .xxl {
    height: 6em;
    width: 6em;
    line-height: 6em;
    background-color: #986534;

  }

  .point-out {
    width: 40px;
    height: 40px;
    margin-left: -20px;
    position: fixed;
    margin-top: 0px;
    border-radius: 50%;

  }
  .accent{
    background-color: #986534;
  }

</style>
