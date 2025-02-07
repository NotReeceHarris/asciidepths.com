import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.location.create({
        data: {
            name: 'stonestoryrpg.com',
        }
    })

    const common = await prisma.rarity.create({
        data: { name: 'Common', colour: '#fffff' },
    })

    const uncommon = await prisma.rarity.create({
        data: { name: 'Uncommon', colour: '#fffff' },
    })
    
    await prisma.rarity.createMany({
        data: [
            { name: 'Rare', colour: '#fffff' },
            { name: 'Epic', colour: '#fffff' },
            { name: 'Legendary', colour: '#fffff' },
            { name: 'Mythic', colour: '#fffff' },
        ]
    })

    await prisma.item.createMany({
        data: [
            {
                name: 'Log',
                description: 'A log.',
                type: 'Resource',
                weight: 1,
                rarityId: common.id,
            },
            {
                name: 'Iron Ore',
                description: 'A chunk of iron ore.',
                type: 'Resource',
                weight: 1,
                rarityId: common.id,
            },
            {
                name: 'Iron Bar',
                description: 'A bar of iron.',
                type: 'Resource',
                weight: 2,
                rarityId: uncommon.id,
            }
        ]
    })
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})