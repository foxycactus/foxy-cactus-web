const interactionMatrix = new Map()

interactionMatrix.set('look_ground', "It's so green...")
interactionMatrix.set('look_player', "It's you! Aren't you handsome.")
interactionMatrix.set('look_sub_ground', "It's so brown...")
interactionMatrix.set('look_space', 'Ah... the final frontier!')

interactionMatrix.set('walk_ground', 'Off you go.')

interactionMatrix.set('talk_player', "Don't talk to yourself. It's weird.")

interactionMatrix.set('grab_player', "Haven't you got better things to do?")
interactionMatrix.set('grab_box', "It's got a nice heft to it...")

const getInteractionMessage = (cursor, interactionPoint) => {
  const message = interactionMatrix.get(`${cursor}_${interactionPoint}`)
  if (message) return message

  if (cursor === 'walk') return "Unlike some boots, that's not made for walking."
  if (cursor === 'talk') return 'It responds with utter silence.'
  if (cursor === 'look') return 'Stop looking at that!'
  if (cursor === 'grab') return "Don't touch that! We don't know where you've been."
}

export const handleInteraction = (cursor, interactionPoint) => {
  document.getElementById('hud-messages').innerHTML = getInteractionMessage(cursor, interactionPoint)
}
