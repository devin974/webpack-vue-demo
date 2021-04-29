<template>
    <div class="app">
        {{ initData }}
        <div class="child-box">
            <p>
                {{ childText }}
            </p>
            <p
                v-for="(item,index) in childList"
                v-html="item"
                :key="`item_${index}`"
            />
        </div>
        
    </div>
</template>

<script>
export default {
    name: 'app',
    data(){
        return {
            initData: '这是初始化数据',
            childText: '我是子数据1',
            childList: ['子项2', '子项3']
        }
    },
}
</script>

<style scoped lang="scss">
.app{
    color: green;
    .child-box{
        display: flex;
        p{
            padding: 0 12px;
        }
    }
}
</style>
