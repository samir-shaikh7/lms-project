from django.db import models
from django.contrib.auth.models import User
from courses.models import Course

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.course}"