import VerticalLayout from './VerticalLayout.js'

export default () => {

  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content' id='loading' data-testid="loading">
        Loading...
      </div>
    </div>`
  )
}