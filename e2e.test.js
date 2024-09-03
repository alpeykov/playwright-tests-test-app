const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000/'; // Application host (NOT service host - that can be anything)
const registerUrl = host + 'register'

let browser;
let context;
let page;

let random = Math.floor(Math.random() * 10000)

let user = {
    email: `${random}@yahoo.com`,
    password: "123456",
    confirmPass: "123456",
};


let album = {
    name: `Random Name ${random}`,
    imgUrl: "https://cdns-images.dzcdn.net/images/cover/693a7bf377793d75228dc8178f187356/1900x1900-000000-80-0-0.jpg",
    price: `${random}`,
    releaseDate: "01.01.2001",
    artist: `Random Artist ${random}`,
    genre: `Random Genre ${random}`,
    description: `Random description ${random}`
}

let lastCreatedId = ""
let editedName=""

describe("e2e tests", () => {
    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });


    describe("authentication", () => {
        test(`#1 Registration`, async ({ page }) => {
            await page.goto(host)
            expect(page.url()).toBe(host)

            await page.click('a[href="/register"]');
            await page.waitForSelector('#registerPage')

            await page.fill('#email', user.email)
            await page.fill('#password', user.password)
            await page.fill('#conf-pass', user.confirmPass)

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('users/register') && response.status() === 200),
                page.click('button:has-text("Register")')

            ])

            await expect(response.ok()).toBe(true)
            let userData = await response.json();
            console.log(userData)

            expect(userData.email).toEqual(user.email)
            expect(userData.password).toEqual(user.password)
            expect(userData._createdOn).not.toBeNull()
            expect(userData._id).not.toBeNull()
            expect(userData.accessToken).not.toBeNull()
        })

        test(`#2 Login`, async ({ page }) => {
            await page.goto(host)
            expect(page.url()).toBe(host)

            await page.click('a[href="/login"]');
            await page.waitForSelector('#loginPage')

            await page.fill('#email', user.email)
            await page.fill('#password', user.password)

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('users/login') && response.status() === 200),
                page.click('button:has-text("Login")')
            ])

            await expect(response.ok()).toBe(true)
            let userData = await response.json();
            console.log(userData)

            expect(userData.email).toEqual(user.email)
            expect(userData.password).toEqual(user.password)
            expect(userData._createdOn).not.toBeNull()
            expect(userData._id).not.toBeNull()
            expect(userData.accessToken).not.toBeNull()
        })

        test(`#3 Logout`, async ({ page }) => {
            await page.goto(host)
            expect(page.url()).toBe(host)

            await page.click('a[href="/login"]');
            await page.waitForSelector('#loginPage')

            await page.fill('#email', user.email)
            await page.fill('#password', user.password)
            await page.click('button:has-text("Login")')

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('users/logout') && response.status() === 204),
                page.click('a:has-text("Logout")')
            ])

            await expect(response.ok()).toBe(true)

            await page.waitForSelector('a[href="/login"]')
            expect(page.url()).toBe(host)
        })
    });

    describe("navbar", () => {
        test(`#4 Nav bar LOGGED user`, async ({ page }) => {
            await page.goto(host)
            expect(page.url()).toBe(host)

            await page.click('a[href="/login"]');
            await page.waitForSelector('#loginPage')

            await page.fill('#email', user.email)
            await page.fill('#password', user.password)
            await page.click('button:has-text("Login")')
            await page.waitForSelector('a[href="/logout"]')
            expect(page.url()).toBe(host)

            let home = await page.$('a[href="/"]')
            let isHomeVisible = await home.isVisible()
            expect(isHomeVisible).toBe(true)

            let catalog = await page.$('a[href="/catalog"]')
            let isCatalogVisible = await catalog.isVisible()
            expect(isCatalogVisible).toBe(true)

            let search = await page.$('a[href="/search"]')
            let isSearchVisible = await search.isVisible()
            expect(isSearchVisible).toBe(true)

            let create = await page.$('a[href="/create"]')
            let isCreateVisible = await create.isVisible()
            expect(isCreateVisible).toBe(true)

            let logout = await page.$('a[href="/logout"]')
            let isLogoutVisible = await logout.isVisible()
            expect(isLogoutVisible).toBe(true)

            const login = await page.$('a[href="/login"]')
            expect(login).toBeNull();

            const register = await page.$('a[href="/register"]')
            expect(register).toBeNull();
        })

        test(`#5 Nav bar GUEST user`, async ({ page }) => {
            await page.goto(host)
            expect(page.url()).toBe(host)

            let home = await page.$('a[href="/"]')
            let isHomeVisible = await home.isVisible()
            expect(isHomeVisible).toBe(true)

            let catalog = await page.$('a[href="/catalog"]')
            let isCatalogVisible = await catalog.isVisible()
            expect(isCatalogVisible).toBe(true)

            let login = await page.$('a[href="/login"]')
            let isLoginVisible = await login.isVisible()
            expect(isLoginVisible).toBe(true)

            let register = await page.$('a[href="/register"]')
            let isRegisterVisible = await register.isVisible()
            expect(isRegisterVisible).toBe(true)

            let create = await page.$('a[href="/create"]')
            expect(create).toBeNull();

            let logout = await page.$('a[href="/logout"]')
            expect(logout).toBeNull();


        })

    });

    describe("CRUD", () => {
        beforeEach(async ({ page }) => {
            await page.goto(host)
            expect(page.url()).toBe(host)

            await page.click('a[href="/login"]');
            await page.waitForSelector('#loginPage')

            await page.fill('#email', user.email)
            await page.fill('#password', user.password)
            await page.click('button:has-text("Login")')
            await page.waitForSelector('a[href="/logout"]')
        })

        test(`#6 Create Album`, async ({ page }) => {
            await page.click('a[href="/create"]')
            await page.waitForSelector('.createPage')

            await page.fill("#name", album.name)
            await page.fill("#imgUrl", album.imgUrl)
            await page.fill("#price", album.price)
            await page.fill("#releaseDate", album.releaseDate)
            await page.fill("#artist", album.artist)
            await page.fill("#genre", album.genre)
            await page.fill(".description", album.description)

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('/data/albums') && response.status() === 200),
                page.click('button:has-text("Add New Album")')
            ])

            await expect(response.ok()).toBe(true)
            let albumData = await response.json();
            console.log(albumData)


            expect(albumData.name).toEqual(album.name)
            expect(albumData.imgUrl).toEqual(album.imgUrl)
            expect(albumData.price).toEqual(album.price)
            expect(albumData.releaseDate).toEqual(album.releaseDate)
            expect(albumData.artist).toEqual(album.artist)
            expect(albumData.genre).toEqual(album.genre)
            expect(albumData.description).toEqual(album.description)
            expect(albumData._ownerId).not.toBeNull
            expect(albumData._createdOn).not.toBeNull
            expect(albumData._id).not.toBeNull

            lastCreatedId = albumData._id
            console.log(lastCreatedId)
        })

        test(`#7 Edit album`, async ({ page }) => {
            await page.waitForSelector('a[href="/search"]')
            await page.click('a[href="/search"]')
            await page.waitForSelector('#searchPage')
            expect(page.url()).toBe(host + 'search')


            await page.fill('#search-input', album.name)
            await page.click('.button-list');
            await page.waitForSelector('.card-box')
            expect(page.url()).toBe(host + 'search')

            await page.click('#details')
            await page.waitForSelector('#box')

            await page.click('.edit')
            await page.waitForSelector('.editPage')

            await page.fill('#name', `EDITED Name_${random}`)
            await page.fill('#price', `${random + 10.99}`)
            await page.fill('#releaseDate', '12.12.2012')
            await page.fill('#artist', `EDITED Artist ${random}`)
            await page.fill('#genre', `EDITED genre ${random}`)
            await page.fill('.description', `EDITED description ${random}`)

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('/data/albums') && response.status() === 200),
                page.click('button:has-text("Edit Album")')
            ])

            await expect(response.ok()).toBe(true)
            let albumData = await response.json();
            console.log(albumData)

            expect(albumData.name).toEqual(`EDITED Name_${random}`)
            expect(albumData.imgUrl).toEqual(album.imgUrl)
            expect(albumData.price).toEqual(`${random + 10.99}`)
            expect(albumData.releaseDate).toEqual('12.12.2012')
            expect(albumData.artist).toEqual(`EDITED Artist ${random}`)
            expect(albumData.genre).toEqual(`EDITED genre ${random}`)
            expect(albumData.description).toEqual(`EDITED description ${random}`)
            expect(albumData._ownerId).not.toBeNull
            expect(albumData._createdOn).not.toBeNull
            expect(albumData._id).not.toBeNull

            editedName=albumData.name
        })

        test(`#8 Delete album`, async ({ page }) => {
            await page.waitForSelector('a[href="/search"]')
            await page.click('a[href="/search"]')
            await page.waitForSelector('#searchPage')
            expect(page.url()).toBe(host + 'search')


            await page.fill('#search-input', editedName)
            await page.click('.button-list');
            await page.waitForSelector('.card-box')
            expect(page.url()).toBe(host + 'search')

            await page.click('#details')
            await page.waitForSelector('#box')

            page.once('dialog', dialog => {
                expect(dialog.message()).toBe('Are you sure?');
                dialog.accept();
            });


            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('/data/albums') && response.status() === 200),
                page.click('.remove')
            ])

            await expect(response.ok()).toBe(true)
            
            let deletedAlbum = await response.json();
            expect(deletedAlbum._deletedOn).not.toBeNull()
            console.log(deletedAlbum)

        })

    });
});
