<template>
    <div class="admin-wrap">
        <v-head></v-head>
        <v-sidebar></v-sidebar>
    </div>
</template>

<script>
import vHead from '../components/AdminDashboard/Header';
import vSiderbar from '../components/AdminDashboard/Sidebar';
import vTags from '../components/AdminDashboard/Tags';

export default {
    components: {
        vHead, vSiderbar, vTags
    },
    data() {
        return {
            
        }
    },
}
</script>

<style scoped>

</style>