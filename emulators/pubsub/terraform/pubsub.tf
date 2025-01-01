resource "google_pubsub_topic" "default" {
  name = var.pubsub_topic_name
}

resource "google_pubsub_subscription" "default" {
  name  = var.pubsub_subscription_name
  topic = google_pubsub_topic.default.name
}
