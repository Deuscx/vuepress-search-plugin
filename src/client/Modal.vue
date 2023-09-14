<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside, useVModel } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    autoClose?: boolean
  }>(),
  {
    modelValue: false,
    autoClose: true,
  },
)

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'update:modelValue', value: boolean): void
}>()

const show = useVModel(props, 'modelValue', emit, { passive: true })
const content = ref(null)

onClickOutside(content, () => {
  if (props.modelValue && props.autoClose) {
    show.value = false
    emit('close')
  }
}, {
  ignore: ['a', 'button', 'summary'],
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <Teleport to="body">
    <div
      v-show="show" class="searchModal"
      role="dialog" aria-modal="true"
    >
      <div class="backdrop" />
      <div ref="content" class="content">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.searchModal {
    position: fixed;
    z-index: 100;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.backdrop {
    position: absolute;
    inset: 0;
    background: rgba(21, 21, 21, 0.9);
    transition: opacity 0.5s;
    z-index: -1;
}

.content {
    max-height: 100vh;
    overflow-y: auto;
}
</style>
