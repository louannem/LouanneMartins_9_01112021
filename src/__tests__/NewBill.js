import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from '../constants/routes.js'
import firebase from "../__mocks__/firebase"
import {localStorageMock} from "../__mocks__/localStorage" 



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("The new bill form should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html   
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
      const newBillForm = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage});

      const form = screen.getByTestId('form-new-bill')
      expect(form).toBeTruthy()
    })

    test("Then I upload a file in the form", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
      const newBillForm = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage});

      //Mocks constants
      const mockCallBack = jest.fn(newBillForm.handleChangeFile)
      const file = new File(['filemock.jpg'], 'filemock.jpg', { type: 'jpg' })
      const uploadBtn = screen.getByTestId('file')
      uploadBtn.addEventListener('change', mockCallBack)    

      //Simulate the event   
      fireEvent.change(uploadBtn, { target: { files: [file] } })
      
      expect(mockCallBack).toHaveBeenCalled()
      expect(file.type).toBe('jpg')
    })

    describe("When I submit the form", () => {
      test("Then a new bill should be created", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const onNavigate = pathname => { document.body.innerHTML = ROUTES({pathname})} 
        const newBill = new NewBill({document, onNavigate, firestore: null, localStorage: localStorageMock });

        const handleSubmit = jest.fn(newBill.handleSubmit)
        const newBillForm = screen.getByTestId("form-new-bill")
        newBillForm.addEventListener('submit', handleSubmit)
        fireEvent.submit(newBillForm)
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})

//test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to the New Bill page", () => {
    test("fetches bills from mock API GET", async () => {

      const postSpy = jest.spyOn(firebase, "post")
      const newBill = {
        id: "3786337",
        vat: "245",
        fileUrl: "htt://mock",
        status: "pending",
        type: "Transport",
        commentary: "",
        name: "Voyage Londres-Paris",
        fileName: "justificatif.jpg",
        date: "22/11/2022",
        amount:736,
        commentAdmin: "",
        email: "a@a",
        pct: 2
      }

      const bills =  await firebase.post(newBill)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)

   })
  })
})