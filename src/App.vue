<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import RButton from './components/RButton.vue'
import Roulette from './components/Roulette.vue'
import HandRadio from './components/HandRadio.vue'
import Countdown from './components/Countdown.vue'

// Refs
// ===========================================================================

const coba = ref(false)

// Phases
// -2: home
// -1: roulette
//  0: ready
//  1: rock
//  2: minus
//  3: result
//  4: shot
const phase = ref('home')

const round = ref(0)

const homeRouletteStep = ref(0)
const homeBullets = ref([0, 0, 0, 0, 0, 0])
const homeBulletShot = ref(false)

const gameRouletteStep = ref(0)
const gameBullets = ref([0, 0, 0, 0, 0, 0])
const gameRouletteShot = ref(false)
const gameBulletShot = ref(false)

const rockTimeUp = ref(false)
const minusTimeUp = ref(false)

const p1LeftHand = ref(null)
const p1RightHand = ref(null)

const cpLeftHand = ref(null)
const cpRightHand = ref(null)

const p1MinusHand = ref(null)
const cpMinusHand = ref(null)

// Computed
// ===========================================================================

const bulletChance = computed(() => {
  return Math.round(1 / (10 - gameRouletteStep.value) * 100)
})

const countdownTime = computed(() => {
  if (round.value >= 7) return 1
  if (round.value >= 4) return 2
  return 3
})

const p1FinalHand = computed(() => {
  if (p1MinusHand.value == null) return null

  if (p1MinusHand.value[1] == p1LeftHand.value) {
    return p1RightHand.value
  } else if (p1MinusHand.value[1] == p1RightHand.value) {
    return p1LeftHand.value
  }

  return null
})

const cpFinalHand = computed(() => {
  if (cpMinusHand.value == cpLeftHand.value) {
    return cpRightHand.value
  } else if (cpMinusHand.value == cpRightHand.value) {
    return cpLeftHand.value
  }

  return null
})

const roundResult = computed(() => {
  if (phase.value == 'result' || phase.value == 'shot') {
    if (p1FinalHand.value == null) return -1

    return compareHands(p1FinalHand.value, cpFinalHand.value)
  }

  return null
})

const p1InfoText = computed(() => {
  if (phase.value == 'result') {
    if (roundResult.value == 1) return 'Win'
    if (roundResult.value == -1) return 'Lose'
  }

  if (gameRouletteShot.value) {
    if (roundResult.value == -1) {
      if (gameBulletShot.value) return 'Death'
      if (!gameBulletShot.value) return 'Safe'
    }

    if (roundResult.value == 1 && gameBulletShot.value) return 'Victory'
  }

  return ''
})

const cpInfoText = computed(() => {
  if (phase.value == 'result') {
    if (roundResult.value == 1) return 'Lose'
    if (roundResult.value == -1) return 'Win'
  }

  if (gameRouletteShot.value && roundResult.value == 1 && !gameBulletShot.value) {
    return 'Safe'
  }

  return ''
})

// Watchers
// ===========================================================================

watch(phase, async newPhase => {
  if (newPhase == 'roulette') {
    prepareGameRoulette()
  }

  if (newPhase == 'ready') {
    await delay(1000)
    gameRouletteShot.value = false
    phase.value = 'rock'
  }

  if (newPhase == 'rock') {
    round.value++
    chooseCpHands()
  }

  if (newPhase == 'minus') {
    chooseCpMinus()
  }

  if (newPhase == 'shot') {
    await delay(1000)
    gameRouletteStep.value++
    gameRouletteShot.value = true
  }
})

watch(homeRouletteStep, newStep => {
  if (newStep == 3) {
    homeBullets.value = getRandomizedBullets()
  }
})

watch(roundResult, async newResult => {
  await delay(2000)

  if (newResult == 0) {
    p1LeftHand.value = null
    p1RightHand.value = null
    p1MinusHand.value = null

    cpLeftHand.value = null
    cpRightHand.value = null
    cpMinusHand.value = null

    phase.value = 'rock'
  } else if (newResult == -1 || newResult == 1) {
    phase.value = 'shot'
  }
})

watch(gameRouletteShot, async newShot => {
  await delay(2000)
  
  if (newShot && roundResult.value == 1 && !gameBulletShot.value) {
    continueRound()
  }
})

// Callback Functions
// ===========================================================================

onMounted(async () => {
  while (phase.value == 'home') {
    await animateHomeRoulette()
  }
})

const onHomeBulletShot = () => {
  homeBulletShot.value = true
}

const onGameBulletShot = () => {
  gameBulletShot.value = true
}

const onRockTimeUp = () => {
  if (p1LeftHand.value == null || p1RightHand.value == null) {
    phase.value = 'result'
    rockTimeUp.value = true
  } else {
    phase.value = 'minus'
  }
}

const onMinusTimeUp = () => {
  if (p1FinalHand.value == null) {
    minusTimeUp.value = true
  }

  phase.value = 'result'
}

// Util Functions
// ===========================================================================

const delay = time => new Promise(res => setTimeout(res, time))

const getRandomizedBullets = () => {
  const bullets = [0, 0, 0, 0, 0, 0]
  const bulletIndex = Math.floor(Math.random() * 6)
  bullets[bulletIndex] = 1

  return bullets
}

const getStrongerHand = hand => {
  if (hand == 'r') return 'p'
  if (hand == 'p') return 's'
  if (hand == 's') return 'r'
}

const compareHands = (hand1, hand2) => {
  if (hand1 == hand2) return 0

  const strongerHand = getStrongerHand(hand1)

  if (hand2 == strongerHand) return -1
  return 1
}

const getMinusIndex = (hands1, hands2) => {
  // Player used same hands.
  // Example: R-P vs R-R.
  if (hands2[0] == hands2[1]) {
    const strongerHand = getStrongerHand(hands2[0])

    if (hands1[0] == strongerHand) return 1
    if (hands1[1] == strongerHand) return 0
    
    if (hands1[0] == hands2[0]) return 1
    return 0
  }

  // Player used same hands as Computer.
  // Example: R-P vs R-P.
  if (hands2.includes(hands1[0]) && hands2.includes(hands1[1])) {
    const compareValue = compareHands(hands1[0], hands1[1])

    if (compareValue == 1) return 1
    return 0
  }

  // Player used different hands as Computer.
  // Example: R-P vs R-S.
  let bestMinus = 0
  if (hands2.includes(hands1[0])) bestMinus = 1

  const random = Math.random()
  
  if (random < 0.33) {
    return bestMinus == 0 ? 1 : 0
  }

  return bestMinus
}

// Functions
// ===========================================================================

const animateHomeRoulette = async () => {
  homeRouletteStep.value = 0
  homeBullets.value = [0, 0, 0, 0, 0, 0]
  homeBulletShot.value = false

  // STEPS
  // Step 0: Initial.
  // Step 1: Insert bullet.
  // Step 2: Hide chambers.
  // Step 3: Spin cylinder.
  // Step 4: Wait.
  // Step 5-10: Shot.
  // Step 11: Reset.

  await delay(1000)

  while (!homeBulletShot.value && homeRouletteStep.value < 11) {
    homeRouletteStep.value++
    await delay(1000)
  }
}

const prepareGameRoulette = async () => {
  gameRouletteStep.value = 0
  gameBullets.value = [0, 0, 0, 0, 0, 0]
  gameBulletShot.value = false

  await delay(1000)

  while (gameRouletteStep.value < 4) {
    gameRouletteStep.value++
    await delay(1000)
  }

  gameBullets.value = getRandomizedBullets()
  phase.value = 'ready'
}

const shootGameRoulette = () => {
  gameRouletteStep.value++
}

const chooseCpHands = () => {
  let choices = ['r', 'p', 's']

  const leftIndex = Math.floor(Math.random() * choices.length)
  cpLeftHand.value = choices.splice(leftIndex, 1)[0]

  const rightIndex = Math.floor(Math.random() * choices.length)
  cpRightHand.value = choices.splice(rightIndex, 1)[0]
}

const chooseCpMinus = () => {
  const cpHands = [cpLeftHand.value, cpRightHand.value]
  const p1Hands = [p1LeftHand.value, p1RightHand.value]

  const minusIndex = getMinusIndex(cpHands, p1Hands)
  cpMinusHand.value = cpHands[minusIndex]
}

const start = () => {
  phase.value = 'roulette'
}

const continueRound = () => {
  p1LeftHand.value = null
  p1RightHand.value = null
  p1MinusHand.value = null

  cpLeftHand.value = null
  cpRightHand.value = null
  cpMinusHand.value = null

  rockTimeUp.value = false
  minusTimeUp.value = false

  phase.value = 'ready'
}

const restart = () => {
  gameRouletteStep.value = 0
  gameRouletteShot.value = false
  gameBulletShot.value = false

  rockTimeUp.value = false
  minusTimeUp.value = false

  round.value = 0

  p1LeftHand.value = null
  p1RightHand.value = null
  p1MinusHand.value = null

  cpLeftHand.value = null
  cpRightHand.value = null
  cpMinusHand.value = null

  phase.value = 'roulette'
}
</script>

<template>
  <div class="relative mx-auto max-w-screen-sm h-screen bg-white
    p-4 sm:p-8 overflow-hidden">
    
    <Transition enter-active-class="transition-transform ease-out delay-100 duration-100"
      enter-from-class="translate-y-full" enter-to-class="translate-y-0">
      
      <div v-if="phase == 'shot' && gameBulletShot && roundResult == -1"
        class="absolute top-0 left-0  w-full h-full
        bg-gradient-to-t from-red-800 via-red-400 via-25% to-white to-90%"></div>
    </Transition>
    
    <Transition enter-active-class="transition-transform ease-out delay-100 duration-100"
      enter-from-class="-translate-y-full" enter-to-class="translate-y-0">
      
      <div v-if="phase == 'shot' && gameBulletShot && roundResult == 1"
        class="absolute top-0 left-0  w-full h-full
        bg-gradient-to-b from-red-800 via-red-400 via-25% to-white to-90%"></div>
    </Transition>
    
    <div class="relative flex flex-col justify-between items-center w-full h-full text-center">
      <!-- Area 1 ========================================================= -->
      <div id="area-1" class="w-full">
        <div class="flex justify-evenly items-center w-full min-h-44 h-1">
          <h1 v-if="phase == 'home'"
            class="font-ultra text-4xl text-gray-900 uppercase">
            Rock Paper<br>
            Scissors<br>
            Minus One
          </h1>

          <!-- CP Left -->
          <Transition enter-active-class="transition-transform ease-out duration-200"
            enter-from-class="-translate-y-48" enter-to-class="translate-y-0">
            
            <div id="cp-left" v-if="phase == 'minus' || phase == 'result'"
              class="flex flex-col justify-stretch items-center w-1/3">
              
              <Transition leave-active-class="transition-transform ease-out duration-200"
                leave-from-class="translate-y-0" leave-to-class="-translate-y-48">

                <HandRadio v-if="phase == 'minus'
                  || (phase == 'result' && rockTimeUp)
                  || (phase == 'result' && cpLeftHand == cpFinalHand)"
                  :id="`cp-final-hand-${cpLeftHand}`" name="cpMinusHand" :value="cpLeftHand"
                  v-model="cpMinusHand" :icon="cpLeftHand" :isCpu="true" :disabled="true"
                  class="w-full" />
              </Transition>
            </div>
          </Transition>
          
          <!-- CP Right -->
          <Transition enter-active-class="transition-transform ease-out duration-200"
            enter-from-class="-translate-y-48" enter-to-class="translate-y-0">

            <div id="cp-right" v-if="phase == 'minus' || phase == 'result'"
              class="flex flex-col justify-stretch items-center w-1/3">
              
              <Transition leave-active-class="transition-transform ease-out duration-200"
                leave-from-class="translate-y-0" leave-to-class="-translate-y-48">

                <HandRadio v-if="phase == 'minus'
                  || (phase == 'result' && rockTimeUp)
                  || (phase == 'result' && cpRightHand == cpFinalHand)"
                  :id="`cp-final-hand-${cpRightHand}`" name="cpMinusHand" :value="cpRightHand" 
                  v-model="cpMinusHand" :icon="cpRightHand" :isCpu="true" :isRight="true"
                  :disabled="true" class="w-full" />
              </Transition>
            </div>
          </Transition>

          <div v-if="phase == 'shot'">
            <p class="font-ultra text-3xl text-gray-900 uppercase">
              {{ cpInfoText }}
            </p>
          </div>
        </div>
      </div>

      <!-- Area 2 ========================================================= -->
      <div class="font-ultra text-3xl uppercase">
        <div v-if="phase == 'result'"
          :class="roundResult >= 1 ? 'text-red-800' : 'text-gray-900'">
          <p>{{ cpInfoText }}</p>
        </div>

        <div v-if="phase == 'shot' && roundResult == 1 && !gameBulletShot">
          <p class="text-red-800">
            <span class="text-5xl">{{ bulletChance }}%</span> to die
          </p>
        </div>
      </div>

      <!-- Area 3 ========================================================= -->
      <div id="area-3" class="w-full font-ultra text-4xl text-gray-900 uppercase">
        <div v-if="phase == 'home'">
          <Roulette :step="homeRouletteStep" :bullets="homeBullets"
            :bulletShot="homeBulletShot"
            @bulletShot="onHomeBulletShot"
            class="mx-auto w-64" />
        </div>

        <div v-if="phase == 'roulette' || phase == 'shot'">
          <Roulette :step="gameRouletteStep" :bullets="gameBullets"
            :bulletShot="gameBulletShot"
            @bulletShot="onGameBulletShot"
            class="mx-auto w-36" />
        </div>

        <div v-if="phase == 'ready'">
          <p>Ready!</p>
        </div>

        <div v-if="phase == 'rock'" class="relative">
          <p>
            Rock<br>
            Paper<br>
            Scissors!
          </p>

          <Countdown :time="countdownTime" :starting="true" @timeUp="onRockTimeUp"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80" />
        </div>

        <div v-if="phase == 'minus'" class="relative">
          <p class="text-red-800">
            Minus<br>
            One!
          </p>

          <Countdown :time="countdownTime" :starting="true" color="red" @timeUp="onMinusTimeUp"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80" />
        </div>

        <div v-if="phase == 'result' && (rockTimeUp || minusTimeUp)">
          <p>Time Up!</p>
        </div>

        <div v-if="phase == 'result' && roundResult == 0">
          <p>Draw</p>
        </div>
      </div>

      <!-- Area 4 ========================================================= -->
      <div class="font-ultra text-3xl uppercase">
        <div v-if="phase == 'result'"
          :class="roundResult >= 1 ? 'text-gray-900' : 'text-red-800'">
          <p>{{ p1InfoText }}</p>
        </div>

        <div v-if="phase == 'shot' && roundResult == -1 && !gameBulletShot">
          <p class="text-red-800">
            <span class="text-5xl">{{ bulletChance }}%</span> to die
          </p>
        </div>
      </div>

      <!-- Area 5 ========================================================= -->
      <div id="area-5" class="w-full">
        <div
          class="flex justify-evenly items-center w-full min-h-44 h-1">

          <div v-if="phase == 'home'"
            class="flex flex-col justify-evenly items-center h-full">
            <RButton @click="start">Start</RButton>

            <a href="https://rotijudi.vercel.app/"
              class="font-medium text-gray-900 hover:text-yellow-800 hover:underline">
              BREAD or LOTTERY
            </a>
          </div>

          <!-- P1 Left -->
          <div id="p1-left" v-if="phase == 'rock' || phase == 'minus'
            || phase == 'result'"
            class="flex flex-col justify-stretch items-center w-1/3">
            
            <div v-if="phase == 'rock'
              || (phase == 'result' && rockTimeUp)"
              class="w-full px-1">
              
              <HandRadio id="p1-left-hand-p" name="p1LeftHand" value="p" 
                v-model="p1LeftHand" icon="p" :disabled="phase == 'result'"
                class="mx-auto w-1/2" />
            </div>
            
            <div v-if="phase == 'rock'
              || (phase == 'result' && rockTimeUp)"
              class="flex justify-stretch items-stretch gap-2 w-full">
              
              <HandRadio id="p1-left-hand-s" name="p1LeftHand" value="s"
                v-model="p1LeftHand" icon="s" :disabled="phase == 'result'"
                class="w-full" />
              <HandRadio id="p1-left-hand-r" name="p1LeftHand" value="r"
                v-model="p1LeftHand" icon="r" :disabled="phase == 'result'"
                class="w-full" />
            </div>

            <Transition enter-active-class="transition-transform ease-out duration-200"
              enter-from-class="translate-y-48" enter-to-class="translate-y-0"
              :leave-active-class="`transition-transform ease-out
              ${phase == 'rock' ? 'duration-0' : 'duration-200'}`"
              leave-from-class="translate-y-0" leave-to-class="translate-y-48">
              
              <HandRadio v-if="phase == 'minus'
                || (phase == 'result' && (p1MinusHand != `l${p1LeftHand}` || minusTimeUp))
                && !rockTimeUp"
                :id="`p1-final-hand-left-${p1LeftHand}`" name="p1MinusHand"
                :value="`l${p1LeftHand}`" v-model="p1MinusHand" :icon="p1LeftHand"
                color="red" :disabled="phase == 'result'" class="w-full" />
            </Transition>
          </div>
          
          <!-- P1 Right -->
          <div id="p1-right" v-if="phase == 'rock' || phase == 'minus'
            || phase == 'result'"
            class="flex flex-col justify-stretch items-center w-1/3">
            <div v-if="phase == 'rock'
              || (phase == 'result' && rockTimeUp)"
              class="w-full px-1">
              
              <HandRadio id="p1-left-right-p" name="p1RightHand" value="p" 
                v-model="p1RightHand" :isRight="true" icon="p"
                :disabled="phase == 'result'" class="mx-auto w-1/2" />
            </div>
            
            <div v-if="phase == 'rock'
              || (phase == 'result' && rockTimeUp)"
              class="flex justify-stretch items-stretch gap-2 w-full">
              
              <HandRadio id="p1-right-hand-r" name="p1RightHand" value="r"
                v-model="p1RightHand" icon="r" :isRight="true"
                :disabled="phase == 'result'" class="w-full" />
              <HandRadio id="p1-right-hand-s" name="p1RightHand" value="s"
                v-model="p1RightHand" icon="s" :isRight="true"
                :disabled="phase == 'result'" class="w-full" />
            </div>

            <Transition enter-active-class="transition-transform ease-out duration-200"
              enter-from-class="translate-y-48" enter-to-class="translate-y-0"
              :leave-active-class="`transition-transform ease-out
              ${phase == 'rock' ? 'duration-0' : 'duration-200'}`"
              leave-from-class="translate-y-0" leave-to-class="translate-y-48">

              <HandRadio v-if="phase == 'minus'
                || (phase == 'result' && (p1MinusHand != `r${p1RightHand}` || minusTimeUp))
                && !rockTimeUp"
                :id="`p1-final-hand-right-${p1RightHand}`" name="p1MinusHand"
                :value="`r${p1RightHand}`" v-model="p1MinusHand" :icon="p1RightHand"
                color="red" :isRight="true" :disabled="phase == 'result'"
                class="w-full" />
            </Transition>
          </div>

          <div v-if="phase == 'shot' && p1InfoText != ''"
            class="flex flex-col justify-evenly items-center w-full h-full">
            <p class="mb-2 font-ultra text-3xl text-gray-900 uppercase">
              {{ p1InfoText }}
            </p>

            <div v-if="!gameBulletShot"
              class="flex flex-col sm:flex-row justify-between items-center gap-2">
              <RButton color="red" @click="shootGameRoulette" class="mx-auto">
                Challenge
              </RButton>
              <RButton @click="continueRound">Continue</RButton>
            </div>
            <div v-else>
              <RButton @click="restart" class="z-50">Restart</RButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
