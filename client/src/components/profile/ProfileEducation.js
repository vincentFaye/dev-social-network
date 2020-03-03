import React from 'react'
import PropTypes from 'prop-types'
import Moment from 'react-moment'

const ProfileEducation = ({ education: { school, degree, fieldofstudy, current, to, from, description }}) => (
  <div>
    <h2 className='text-dark'>{school}</h2>
    <p>
      <Moment format='YYYY/MM/DD'>{from}</Moment> - {' '}{!to ? (' Now') : (<Moment format='YYYY/MM/DD'>{to}</Moment>) }
    </p>
    {
      degree && (
        <p>
          <strong>Degree: </strong>{degree}
        </p>
      )
    }
    {
      fieldofstudy && (
        <p>
          <strong>Field Of Study: </strong>{fieldofstudy}
        </p>
      )
    }
    {
      description && (
        <p>
          <strong>Description: </strong>{description}
        </p>
      )
    }
  </div>
)

ProfileEducation.propTypes = {
  education: PropTypes.object.isRequired
}

export default ProfileEducation
