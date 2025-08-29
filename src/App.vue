<template>
  <div class="container">
    <section class="controls">
      <Controls />
    </section>
    <section class="content">
      <div class="left">
        <HorseList />
      </div>
      <div class="right">
        <RaceTrack />
      </div>
      <div class="left">
        <Results />
      </div>
    </section>
  </div>

</template>

<script>
import Controls from './components/Controls.vue'
import HorseList from './components/HorseList.vue'
import RaceTrack from './components/RaceTrack.vue'
import Results from './components/Results.vue'

export default {
  name: 'App',
  components: { Controls, HorseList, RaceTrack, Results }
}
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 12px;
}

.controls {
  margin-bottom: 16px;
}

.content {
  display: grid;
  grid-template-columns: 33% 33% 33%;
  gap: 16px;
  align-items: start;
}

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
