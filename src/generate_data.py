import sys, calendar, json, math, random


def get_days_list(year):
    days = []
    cal = calendar.Calendar().yeardatescalendar(year, 12)[0]
    while cal[0][0][0].year != year:
        cal[0][0].pop(0)
    while cal[-1][-1][-1].year != year:
        cal[-1][-1].pop(-1)
    for month in cal:
        for week in month:
            days += week
    return days


def get_equation():
    a = random.gauss(0, .002)
    b = random.gauss(0, .001)
    c = random.gauss(0, .001)
    d = random.gauss(1.1, .04)
    e = random.gauss(1.1, .04)
    f = random.triangular(.002, .02, .01)
    g = random.randint(0, 365)
    h = random.gauss(0, .0004)
    pivot = (-182.5 - .5 * g) * h

    return lambda x: h * x + pivot + (
            math.sin(a * (x + g)) + math.cos(b * math.pow((x + g), d)) + math.sin(c * math.pow((x + g), e))) * f


# noinspection SpellCheckingInspection
def get_diastolic(syst):
    return syst * random.gauss(.66, .06) + 10


# noinspection SpellCheckingInspection
def generate_data():
    generated = {"steps_per_day": [], "blood_pressure_data": []}
    days = get_days_list(2020)
    equation = get_equation()

    seed_bp = random.gauss(126, 5)
    seed_steps = random.gauss(6000, 1000)

    for i in range(random.randrange(5 * 50, 5 * 54)):
        day = random.randrange(0, 365)
        expected_syst = (1 - equation(day - 14)) * seed_bp
        systolic = random.gauss(expected_syst, expected_syst * .07)
        diastolic = get_diastolic(systolic)
        generated["blood_pressure_data"].append({
            "day_index": day,
            "month": days[day].month,
            "day": days[day].day,
            "weekday": days[day].weekday(),
            "systolic": systolic,
            "diastolic": diastolic
        })

    for i in range(365):
        date = days[i]
        is_weekend = date.weekday() > 5
        expected_steps = (1 + equation(i)) * seed_steps
        steps = round(random.triangular(seed_steps - seed_steps * .66, seed_steps + seed_steps * .66, expected_steps))
        if is_weekend:
            steps = round(steps * 1.2)
        generated["steps_per_day"].append(steps)

    return generated


if __name__ == "__main__":
    try:
        output_name = sys.argv[1]
    except IndexError:
        output_name = "data"
    data = generate_data()
    with open(output_name + ".json", "w") as export:
        json.dump(data, export)
        export.close()
