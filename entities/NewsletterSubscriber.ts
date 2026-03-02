{
  "name": "NewsletterSubscriber",
  "type": "object",
  "properties": {
	"email": {
	  "type": "string",
	  "format": "email",
	  "description": "Subscriber's email address"
	},
	"name": {
	  "type": "string",
	  "description": "Subscriber's name (optional)"
	},
	"status": {
	  "type": "string",
	  "enum": [
		"active",
		"unsubscribed"
	  ],
	  "default": "active",
	  "description": "Subscription status"
	}
  },
  "required": [
	"email"
  ]
}