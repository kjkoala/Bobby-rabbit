<script lang="ts">
    import { bobbyCarrotLogo } from "src/app/bobbyCarrot";

    export let loader: number = 0

</script>
    <div class="loading">
        <img src={bobbyCarrotLogo} alt="logo" class="logo" />

        <progress value={loader} class="progress" />
    </div>
<style>

    .loading {
        pointer-events: none;
        position: absolute;
        width: 100%;
        height: 100%;
        color: white;
        background: radial-gradient(circle at center, #d8f1ff 10%, #2084bd 50%, #0b6498 70%)
    }

    .logo {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, calc(-50% - 100px));
    }

    .progress {
        -webkit-appearance: none;
        width: min(500px, 90%);
        border-radius: 15px;
        overflow: hidden;
        background: inherit;
        box-shadow: 0 0px 0px 2px black;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    ::-moz-progress-bar {
        background-color: black !important;
    }

    ::-webkit-progress-bar {
        background-color: black !important;
    }

    ::-webkit-progress-value {
        background-color: #f4890b !important;
    }
</style>