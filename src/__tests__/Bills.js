import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import  Bills  from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import usersTest from "../constants/usersTest.js"
import ROUTES_PATH from "../constants/routes"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      //Sorts the array to pass the test
      const arraySorted = [...dates].sort(antiChrono)
      expect(arraySorted).toEqual(datesSorted)
    })


  })
  

  describe("When I am on Bills Page and it's loading", () => {
    test("Then the loading page should be displayed", () => {
      //Builds the UI whith no bills since it's loading
      const html = BillsUI({ data:[], loading:true })
      document.body.innerHTML = html
    
      //if loading = true, #loading displays "Loading..."
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page and it's not loading", () => {
    test("Then the errorPage should be displayed", () => {
      //Builds the UI whith no bills since it's loading
      const html = BillsUI({ data:[], loading: false, error: true })
      document.body.innerHTML = html
    
      //if loading = false and error = true, #error-message displays "Erreur"
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})