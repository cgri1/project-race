<template>
  <div>
    <h3>All Horses (20)</h3>
    <div class="grid">
      <div class="card" v-for="h in horses" :key="h.id">
        <div class="swatch" :style="{ backgroundColor: h.color }"></div>
        <div class="info">
          <div class="name" :style="{ color: h.color }">{{ h.name }}</div>
          <div class="meta">Condition: {{ h.condition }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'HorseList',
  computed: {
    ...mapState(['horses'])
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}
.card {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  background: #fafafa;
}
.swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.name { font-weight: 600;  }
.meta { color: #666; font-size: 12px; }
</style>


