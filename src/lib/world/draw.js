import store from '../../state/store'
import gameConfiguration from '../gameConfiguration'
import loadImages from '../loadImages'
import { items } from './items'

let heroIsLookingLeft = false
const heroImage1Source = '/images/hero_1.png'
const heroImage2Source = '/images/hero_2.png'

function draw(_) {
  const { worldTileSize, worldMap, hero: { position, destination, nextPosition, canvasOffset } } = store.getState()

  _.canvas.width = worldTileSize * gameConfiguration.worldWidth
  _.canvas.height = worldTileSize * gameConfiguration.worldHeight

  _.clearRect(0, 0, _.canvas.width, _.canvas.height)
  
  const imageSourcesToLoad = [
    heroImage1Source,
    heroImage2Source,
  ]

  // Set images to load
  worldMap.tiles.forEach(row => {
    row.forEach(tile => {
      imageSourcesToLoad.push(tile.backgroundImageSource)

      if (tile.item) imageSourcesToLoad.push(...tile.item.imageSources)
    })
  })

  worldMap.monstersGroups.forEach(monstersGroup => {
    imageSourcesToLoad.push(monstersGroup.monsters[0].avatarSource)
  })

  return loadImages(imageSourcesToLoad)
  .then(images => {

    // Draw background
    worldMap.tiles.forEach((row, j) => {
      row.forEach((tile, i) => {
        _.drawImage(images[tile.backgroundImageSource], i * worldTileSize, j * worldTileSize, worldTileSize, worldTileSize)
        // _.strokeRect(i * worldTileSize, j * worldTileSize, worldTileSize, worldTileSize)
      })
    })

    // Draw items
    worldMap.tiles.forEach((row, j) => {
      row.forEach((tile, i) => {
        if (tile.item) items[tile.item.name].draw(_, images, worldTileSize, i, j, tile.item.parameters)
      })

      // Draw hero at correct position
      // So items don't overflow him
      if (j === position.y) {
        _.save()

        const useHeroImage1 =
          canvasOffset.x + canvasOffset.y === 0 // Use second image only when moving
          || ((destination.x + destination.y) - (position.x + position.y)) % 2 === 0

        heroIsLookingLeft = !nextPosition || nextPosition.x === position.x ? heroIsLookingLeft : nextPosition.x < position.x

        if (!heroIsLookingLeft) _.scale(-1, 1)

        const heroImage = images[useHeroImage1 ? heroImage1Source : heroImage2Source]

        _.drawImage(
          heroImage,
          heroIsLookingLeft ? worldTileSize * (position.x + canvasOffset.x + 0.15) : -worldTileSize * (position.x + canvasOffset.x + 0.85),
          worldTileSize * (position.y + canvasOffset.y - 0.2),
          worldTileSize * 0.6,
          worldTileSize * heroImage.height / heroImage.width * 0.6
        )

        _.restore()
      }

      worldMap.monstersGroups
      .filter(monstersGroup => monstersGroup.position.y === j)
      .forEach(monstersGroup => {

        _.drawImage(
          images[monstersGroup.monsters[0].avatarSource],
          worldTileSize * (monstersGroup.position.x),
          worldTileSize * (monstersGroup.position.y),
          worldTileSize,
          worldTileSize
        )
      })
    })

  })
  .catch(console.error)
}

export default draw
