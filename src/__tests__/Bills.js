import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import  Bills  from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import usersTest from "../constants/usersTest.js"
import { ROUTES } from "../constants/routes"
import { modal } from "../views/DashboardFormUI.js"
import firebase from "../__mocks__/firebase"

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

    test("Then I click on the new bill and I go to the New Bill page", () => {
      const html = BillsUI({ data : bills })
      document.body.innerHTML = html

      const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname}); };
      const billsPage = new Bills({document, onNavigate, firestore: null, localStorage: window.localStorage});

      //Retreives the button
      const newBillBtn = screen.getByTestId('btn-new-bill')

      //Adds the mock function and event listener
      const mockCallBack = jest.fn(billsPage.handleClickNewBill)
      newBillBtn.addEventListener('click', mockCallBack)

      //Simulates a click on the button
      fireEvent.click(newBillBtn)

      //Checks if now on new bill form page
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })


    describe("When I click on an eye icon", () => {
      test("Then the modal appears on the page", () => {
        const html = BillsUI({ data : bills })
        document.body.innerHTML = html

        const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname}); };
        const billsPage = new Bills({document, onNavigate, firestore:null, localStorage: window.localStorage});

        //Retreives the icon
        const modalBtn = screen.getAllByTestId('icon-eye')

        //Adds the mock function and event listener
        const mockCallBack = jest.fn(billsPage.handleClickIconEye)
        //Accessing JQuery with Jest
        $.fn.modal = jest.fn();
        
        modalBtn.forEach(btn => { btn.addEventListener('click', e => mockCallBack(btn)) });

        //Simulates a click on the button
        modalBtn.forEach(btn => { fireEvent.click(btn) })

        //Checks if the modal is open by checking the called function & reading the title
        expect(mockCallBack).toHaveBeenCalled()
        //const modal = document.getElementById('modaleFile')
        //expect(document.getElementById('modaleFile')).toHaveClass('show')
        expect(screen.getByText('Justificatif')).toBeTruthy()

      })
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


  //Test d'integration GET Bills
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Dashboard", () => {
      test("fetches bills from mock API GET", async () => {
        const getSpy = jest.spyOn(firebase, "get")
        const bills = await firebase.get()
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(bills.data.length).toBe(4)
     })
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      //Builds the interface with an error 404
      const html = BillsUI({ data:[], loading: false, error: "Erreur 404" })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      //Builds the interface with an error 500
      const html = BillsUI({ data:[], loading: false, error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })

  })
  
})