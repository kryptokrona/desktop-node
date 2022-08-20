<script>

  const closeApp = () => {
    window.api.send("hide");
  };

  const minimizeApp = () => {
    window.api.send("min");
  };
</script>

<div class="actions">
  <div on:click={closeApp} class="circle red"></div>
  <div on:click={minimizeApp} class="circle orange"></div>
</div>

<style lang="scss">
  .actions {
    position: fixed;
    top: 11px;
    left: 13px;
    display: flex;
    gap: 0.5rem;
    border-radius: 20px;
    z-index: 9999;
    cursor: pointer;

    div {
      width: 12px;
      height: 12px;
      border-radius: 50px;
      z-index: 9999;
      background-color: var(--button-background);
      transition: 200ms ease-in-out;

      &:first-child {
        background-color: var(--warn-color);
      }

      &:last-child {
        background-color: var(--alert-color);
      }
    }
  }
</style>