import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { Grid, Row, Col } from 'react-flexbox-grid'

class ConsulServices extends Component {

  render() {
    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='navigation-pane' xs={ 6 } sm={ 6 } md={ 4 } lg={ 3 }>
            <Card>
              <CardTitle title='Services' />
              <CardText>
                <List>
                  <ListItem primaryText='Inbox' />
                  <ListItem primaryText='Starred' />
                  <Divider />
                  <ListItem primaryText='Sent mail' />
                  <ListItem primaryText='Drafts' />
                  <ListItem primaryText='Inbox' />
                </List>
              </CardText>
            </Card>
          </Col>
          <Col key='value-pane' xs={ 6 } sm={ 6 } md={ 8 } lg={ 9 }>
            <Card>
              <CardTitle title='Manage' />
              <CardText>
                derp
              </CardText>
            </Card>
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps () {
  return { }
}

ConsulServices.defaultProps = {

}

ConsulServices.propTypes = {

}

export default connect(mapStateToProps)(ConsulServices)
