import sys, datetime, json, math, random


def get_days_list(year):
    """Returns list of date objects for a given year"""
    days = []
    start = datetime.date(year, 1, 1)
    end = datetime.date(year + 1, 1, 1)

    for i in range((end - start).days):
        day = start + datetime.timedelta(days=i)
        days.append(day)
    return days


def get_equations():
    """
    Returns equations to calculate "expected" data for use in mocking correlation.

    Built to gradually change over 1 year period.
    """
    a = random.gauss(0, .002)
    b = random.gauss(0, .001)
    c = random.gauss(0, .001)
    d = random.gauss(1.1, .04)
    e = random.gauss(1.1, .04)
    f = random.triangular(.002, .02, .01)
    g = random.randint(0, 400)
    h = random.triangular(0, .0012, .0008) * random.choice([1, -1])

    def base_equation(x):
        """Builds random oscillating curve"""
        return math.sin(a * (x + g)) + math.cos(b * math.pow((x + g), d)) + math.sin(c * math.pow((x + g), e))

    def include_slope(slope, x):
        """"Rotates" the equation to give a general slope over time"""
        pivot = (-182.5 - .5 * g) * slope
        return slope * x + pivot

    # Note: returns two equations to simplify calculations later.
    # Assumes blood pressure and steps taken are inversely correlated, and that changes over time will
    # be less pronounced in blood pressure
    return {
        "bp": lambda x: base_equation(x) * f + include_slope(h / 2, x),
        "steps": lambda x: base_equation(x) * f * 2 + include_slope(-h * 2, x)
    }


# noinspection SpellCheckingInspection
def get_diastolic(syst):
    """Returns approximate diastolic reading for a given systolic reading"""
    return syst * random.gauss(.66, .06) + 10


# noinspection SpellCheckingInspection
def generate_data():
    """
    Main generator function

    Builds out a data set (currently hard-coding the year as 2020).
    Returns a dictionary comprised of:

    - an array of "steps_per_day" data, containing a single entry for every day, and an array.

    - an array of "blood_pressure_data", containing systolic and diastolic information for approximately 260 bp readings (or about 5 per week).

    Data is approximated based off a generated set of equations, and is loosely selected via gaussian distribution
    around said equations.
    """
    generated = {"steps_per_day": [], "blood_pressure_data": [], "dates": []}
    year = 2020
    days = get_days_list(year)
    equations = get_equations()

    seed_bp = random.gauss(126, 5)
    seed_steps = random.gauss(6000, 1000)

    generated["dates"] = [day.isoformat() for day in days]

    for i in range(random.randrange(5 * 50, 5 * 54)):
        day = random.randrange(0, 366 if year % 4 else 365)
        # Note: expected bp value is shifted back 7 days to simulate changes in bp lagging changes in exercise  
        expected_syst = (1 + equations["bp"](day - 7)) * seed_bp
        systolic = round(random.gauss(expected_syst, expected_syst * .07))
        diastolic = round(get_diastolic(systolic))
        generated["blood_pressure_data"].append({
            "date": day,
            "systolic": systolic,
            "diastolic": diastolic
        })

    for i in range(len(days)):
        date = days[i]
        expected_steps = (1 + equations["steps"](i)) * seed_steps
        min_steps = round(random.gauss(seed_steps * .2, 50))
        steps = round(random.gauss(expected_steps, expected_steps * .33))
        steps = max(steps, min_steps, 0)  # no negative step counts!
        if date.weekday() > 5:
            steps = round(steps * 1.2)   # assumes slightly more activity on weekends
        generated["steps_per_day"].append(steps)
    return generated


if __name__ == "__main__":
    try:
        output_name = sys.argv[1]
    except IndexError:
        output_name = "data"
    data = None
    # Handles occasional value error
    while data is None:
        try:
            data = generate_data()
        except ValueError:
            pass
    with open(output_name + ".json", "w") as export:
        json.dump(data, export)
        export.close()
