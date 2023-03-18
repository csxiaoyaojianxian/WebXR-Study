<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
ul,
li {
  list-style: none;
}

html {
  font-size: calc(100vw / 19.2);
}

body {
  font-size: 16px;
}

#cssrender {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
}

.elementTag {
  position: relative;
  left: -30px;
  top: 15px;
}

.elementTag::before {
  content: "";
  display: block;
  position: absolute;
  width: 100px;
  height: 1px;
  background: rgb(127 177 255 / 75%);
  bottom: 0;
  right: -100px;
  transform: rotate(30deg);
  transform-origin: 0 0;
}

.elementTag::after {
  content: "";
  display: block;
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgb(127 177 255 / 75%);
  bottom: -65px;
  right: -105px;
}

.elementContent {
  background-color: rgba(20, 143, 221, 0.68);
  box-shadow: 0 0 12px rgba(0, 128, 255, 0.75);
  border: 1px solid rgba(127, 177, 255, 0.75);
  padding: 20px;
  color: #efefef;
}

.elementContent h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}
</style>
