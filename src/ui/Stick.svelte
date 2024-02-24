<script lang="ts">
  import { onMount } from "svelte";
  export let onBusy: (isBusy: boolean) => void = () => {};
  export let onMove: (coords: number) => void = () => {};

  const DIRECTIONS: [number, number][] = [
      [-135, -45],  // top
      [-45, 45],    // right
      [45, 135],    // bottom
      [135, 180],   // left
      [-180, -135]
    ];

  // elements
  let stick: HTMLDivElement;
  let stickRoot: HTMLDivElement;
  let stickControl: HTMLDivElement;
  let prevCoord: number = -1;

  // sizes
  let stickSize: number;
  let stickRadius: number;
  let stickRadiusPercent: number;
  let stickRootPosition: DOMRect;

  // state
  let isStickBusy: boolean = false;

  function setInitialValues() {
    stickSize = stick.clientHeight;
    stickRadius = stickSize / 2;
    stickRadiusPercent = stickRadius / 100;
    stickRootPosition = stickRoot.getBoundingClientRect();
  }

  function getDistanceToCenter(coordinates: [number, number]) {
    return Math.sqrt((coordinates[0] * coordinates[0]) + (coordinates[1] * coordinates[1]));
  }

  function isInStickCircle(coordinates: [number, number]) {
    return getDistanceToCenter(coordinates) < stickRadius;
  }

  function getStickValidNearestCoordinates(coordinates: [number, number]): [number, number] {
    let toCenter = getDistanceToCenter(coordinates);
    let x = coordinates[0] / toCenter * stickRadius;
    let y = coordinates[1] / toCenter * stickRadius;
    return [x, y];
  }

  function getStickCoordinates(event: TouchEvent) {
    let touches = event.targetTouches[0];
    let pageX = touches.pageX;
    let pageY = touches.pageY;
    let x = pageX - stickRootPosition.left;
    let y = pageY - stickRootPosition.top;
    let coordinates: [number, number] = [x, y];

    if (!isInStickCircle(coordinates)) {
      coordinates = getStickValidNearestCoordinates(coordinates);
    }

    return coordinates;
  }

  function angleInRange(angle: number, [rangeStart, rangeEnd]: [number, number]) {
    return angle > rangeStart && angle <= rangeEnd;
  }

  function getStickDirection(coordinates: [number, number]): [number, number] {
    let angle = Math.atan2(coordinates[1], coordinates[0]) * 180 / Math.PI;
    let direction = DIRECTIONS.find((ragnes) => angleInRange(angle, ragnes)) as [number, number];
    let directionIndex = Math.min(DIRECTIONS.indexOf(direction), 3)

    let intensity = Math.ceil(getDistanceToCenter(coordinates) / stickRadiusPercent);
    intensity = Math.min(intensity, 100);
    return [directionIndex, intensity];
  }

  function updateStickPosition([x, y]: [number, number] = [0, 0]) {
    stickControl.style.transform = `translate(${x}px, ${y}px)`;
  }

  function stickStart(event: Event) {
    if (event instanceof TouchEvent) {
      const touch = event.targetTouches[0]
      stick.style.top = touch.clientY - stickRadius + 'px'
      stick.style.left = touch.clientX - stickRadius + 'px'
    }
    isStickBusy = true;
    onBusy(true);
    setInitialValues();
  }


  function stickMove(event: Event) {
    if (isStickBusy) {
      let coordinates = getStickCoordinates(event as TouchEvent);
      let direction = getStickDirection(coordinates);
      updateStickPosition(coordinates);
      if (prevCoord !== direction[0]) {
        prevCoord = direction[0];
        onMove(direction[0]);
      }
    }
  }

  function stickEnd() {
    isStickBusy = false;
    prevCoord = -1;
    onBusy(false);
    updateStickPosition();
  }

  onMount(() => {
    const root = document.querySelector('#root')!

    setInitialValues()

    root.addEventListener('touchstart', stickStart, { passive: true });
    root.addEventListener('touchmove', stickMove, { passive: true });
    root.addEventListener('touchend', stickEnd, { passive: true });

    
    return () => {
      root.removeEventListener('touchstart', stickStart);
      root.removeEventListener('touchmove', stickMove);
      root.removeEventListener('touchend', stickEnd);
    }
  })

</script>

  <div class="stick" bind:this={stick}>
    <div class="stick__root" bind:this={stickRoot}>
      <div class="stick__control" bind:this={stickControl} />
    </div>
  </div>

<style>
.stick {
  opacity: 0.6;
  pointer-events: none;
  background: #2d2d2d;
  border: 2px solid #626262;
  border-radius: 50%;
  bottom: 10%;
  box-sizing: border-box;
  height: 110px;
  position: absolute;
  right: 10%;
  width: 110px;
}
.stick__root {
  border: 2px solid #626262;
  border-radius: 50%;
  height: 0;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0;
}
.stick__control {
  cursor: move;
  position: absolute;
  z-index: 1;
}
.stick__control:after {
  background: rgba(98, 98, 98, .85);
  border: 2px solid #fff;
  border-radius: 50%;
  box-sizing: border-box;
  content: '';
  height: 56px;
  left: -28px;
  position: absolute;
  top: -28px;
  width: 56px;
}
</style>