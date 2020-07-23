<template>
  <div  >
    <h1>{{ msg }}</h1>
    <h2>Are you ready to start your dev complexity estimation session?</h2>
    <ul>
      <li>
        <img :src="require('../assets/agile-estimator.png')" class="start_estimator" v-on:click="startANewSession" />
      </li>
    </ul>
    <EstimateStarter :display="showModal" @close="showModal =false" />
</div>



</template>

<script>
import EstimateStarter from './AgileEstimatorSessionStarter.vue'
export default {
  name: 'Agile_Estimator_Home',
  data () {
    return {
      msg: 'Welcome to Agile estimator',
      showModal:false
    }
  },
  components: {EstimateStarter},
  methods:{
  startANewSession: function() {
    this.showModal=true

  }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.start_estimator{
  border-radius: 50%;
  width:300px;
  height:300px;
}
</style>
